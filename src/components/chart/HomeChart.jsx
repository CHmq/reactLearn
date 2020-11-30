import React, { useState, useEffect } from "react";
import intl from "react-intl-universal";
import { useSelector } from "react-redux";

import { Chart, Geom, Axis, Tooltip, Coord, Legend, Guide } from "bizcharts";

import { getStorage } from "components/services/school";

// 保留小数点后两位
function customToFixed(number) {
  return number.toFixed(2);
}

const HomeChart = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [data, setData] = useState([]);

  const initDone = useSelector((state) => state.translations.initDone);

  // 多语言
  const fn = function (value) {
    return initDone && intl.get("general.select." + value);
  };

  // 调用 api 拉取数据
  async function callGetStorage() {
    const cache = await getStorage();

    // 所有size
    const total = cache.reduce((acc, cur) => {
      console.log(acc, parseFloat(cur.total_size, 10));
      return acc + parseFloat(cur.total_size, 10);
    }, 0);

    // 处理数据
    setData(
      cache.map((item) => {
        const floatNum = parseFloat(item.total_size, 10);
        return {
          item: `${fn(item.name)} ${
            floatNum > 512
              ? `${customToFixed(floatNum / 1024)}GB`
              : `${customToFixed(floatNum)}MB`
          } ${
            ((customToFixed(item.total_size / total) * 100) / 100) * 100 + "%"
          }`,
          count: item.school_id,
          // 取小数最后两位的百分比
          percent: customToFixed((item.total_size / total) * 100) / 100,
        };
      })
    );
  }

  useEffect(() => {
    callGetStorage();
  }, []);

  const cols = {
    percent: {
      formatter: (val) => `${val * 100}%`,
    },
  };

  return (
    <div>
      <Chart
        // width={window.innerWidth}
        height={500}
        data={data}
        scale={cols}
        padding="auto"
        forceFit
        onGetG2Instance={(chart) => {
          // 饼图绘制多次会导致setSelected处理不生效，
          // 通过afterrender生命周期重新触发选中
          // 设置默认选中
          // this.chartIns = chart;
          const geom = chart.get("geoms")[0]; // 获取所有的图形
          const items = geom.get("data"); // 获取图形对应的数据
          setSelectedIdx(items[selectedIdx]);
          console.log("render");
          chart.on("afterrender", (e) => {
            const geom = chart.get("geoms")[0]; // 获取所有的图形
            const items = geom.get("data"); // 获取图形对应的数据
            geom.setSelected(items[selectedIdx]);
            console.log("re render");
          });
        }} // 设置选中
        // onPlotClick={(ev) => {
        //   console.log(ev);
        // }}
      >
        <Coord type="theta" radius={0.6} innerRadius={0.75} />
        <Axis name="percent" />
        <Legend
          position="right"
          offsetY={-window.innerHeight / 2 + 120}
          offsetX={-100}
        />

        <Tooltip
          showTitle={false}
          itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}</li>'
        />
        <Geom
          type="intervalStack"
          position="percent"
          color="item"
          tooltip={[
            "item*percent*",
            (item, percent) => {
              percent = `${percent * 100}%`;
              return {
                name: item,
                value: percent,
              };
            },
          ]}
          style={{
            lineWidth: 1,
            stroke: "#fff",
          }}
        />
        {/* <Guide>
          <Guide.Text
            top
            position={["50%", "50%"]}
            content={`${data.length ? data[selectedIdx].item : ""}`}
            style={{ textAlign: "center", fontSize: 24 }}
          />
        </Guide> */}
      </Chart>
    </div>
  );
};

export default HomeChart;
