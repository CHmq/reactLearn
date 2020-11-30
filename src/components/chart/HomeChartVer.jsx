import React, { Component } from "react";
import { Col } from "antd";
import intl from "react-intl-universal";
import { connect } from "react-redux";

import { Chart, Geom, Axis, Tooltip, Coord, Legend, Guide } from "bizcharts";

import { getStorage } from "components/services/school";

function customToFixed(number) {
  return number.toFixed(2);
}

// function totalCalc(data) {
//   const total = data.reduce(
//     (acc, cur) => acc + parseFloat(cur.total_size, 10),
//     0
//   );
//   return total;
// }

export class HomeChartVer extends Component {
  state = {
    selectedIdx: 0,
    selected: {},
    data: [],
    sizeTotal: 0,
  };

  async componentDidMount() {
    const cache = await getStorage();

    // 所有size
    const total = cache.reduce(
      (acc, cur) => acc + parseFloat(cur.total_size, 10),
      0
    );

    // 处理数据
    this.setState({
      data: cache.map((item) => {
        const floatNum = parseFloat(item.total_size, 10);
        return {
          item: `${this.fn(item.name)} ${
            floatNum > 512
              ? `${customToFixed(floatNum / 1024)}GB`
              : `${customToFixed(floatNum)}MB`
          } ${
            (customToFixed((item.total_size / total) * 100)) + "%"
          }`,
          count: item.school_id,
          // 取小数最后两位的百分比
          percent: customToFixed((item.total_size / total) * 100) / 100,
        };
      }),
      sizeTotal: total,
    });
  }

  fn = (value) => {
    const { initDone } = this.props.translations;
    console.log(initDone);
    return initDone && intl.get("general.select." + value);
  };

  cols = {
    percent: {
      formatter: (val) => `${val * 100}%`,
    },
  };

  render() {
    return (
      !!this.state.sizeTotal && (
        <Col xs={24} md={6} lg={6} xl={6}>
          <Chart
            // width={window.innerWidth}
            height={300}
            data={this.state.data}
            scale={this.cols}
            padding={-30}
            forceFit
            onGetG2Instance={(chart) => {
              // 饼图绘制多次会导致setSelected处理不生效，
              // 通过afterrender生命周期重新触发选中
              // 设置默认选中
              this.chartIns = chart;
              const { selectedIdx } = this.state;
              const geom = chart.get("geoms")[0]; // 获取所有的图形
              const items = geom.get("data"); // 获取图形对应的数据
              this.setState({
                selected: items[selectedIdx],
              });
              console.log("render");
              chart.on("afterrender", (e) => {
                const { selectedIdx } = this.state;
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
            {/* <Legend position="right" offsetY={-65} offsetX={-20} /> */}

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
            <Guide>
              <Guide.Text
                top
                position={["50%", "50%"]}
                content={`${customToFixed(this.state.sizeTotal / 1024)}GB`}
                style={{ textAlign: "center", fontSize: 24 }}
              />
            </Guide>
          </Chart>
        </Col>
      )
    );
  }
}

/** redux 獲得全局數據 */
function mapStateToProps({ translations }) {
  return {
    translations,
  };
}

export default connect(mapStateToProps)(HomeChartVer);
