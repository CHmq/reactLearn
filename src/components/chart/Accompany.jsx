/**
 * 父母陪同看的次数
 */
import React, { Component } from "react";
import {
  Chart,
  Geom,
  Axis,
  // Tooltip,
  Coord,
  Legend
} from "bizcharts";
import DataSet from "@antv/data-set";

class Accompany extends Component {
  render() {
    const { DataView } = DataSet;
    // item就是类名,value 就是值 
    const data = [
      {
        item: "自己觀看",
        value: 3
      },
      {
        item: "親子觀看",
        value: 9
      }
    ];
    const dv = new DataView();
    dv.source(data).transform({
      type: "percent",
      field: "value",
      dimension: "item",
      as: "percent"
    });
    const cols = {
      percent: {
        formatter: val => {
          val = val * 100 + "%";
          return val;
        }
      }
    };
    return (
      <div style={{paddingTop: "50px"}}>
        {/* 調整圖像的高度 height */}
        <Chart
          height={105}
          data={dv}
          scale={cols}
          padding={["auto", 100, "auto", "auto"]}
          forceFit
        >
          <Coord type="theta" position={"left-center"} radius={1} />
          <Axis name="percent" />
          <Legend
            // useHtml，containerTpl，itemTpl 這些屬性屬於自定義；去掉就恢復默認的顯示
            useHtml={true}
            // containerTpl 裏面設置了width
            containerTpl='<div class="g2-legend"><table class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;width:95px;"></table></div>'
            itemTpl={(value, color, checked, index) => {
              const obj = dv.rows[index];
              checked = checked ? "checked" : "unChecked";
              return (
                '<tr class="g2-legend-list-item item-' +
                index +
                " " +
                checked +
                '" data-value="' +
                value +
                '" data-color=' +
                color +
                // 字體大小
                ' style="margin-right: 10px;cursor: pointer;font-size: 12px;">' +
                '<td width=70 style="border: none;padding:0;color:#fff;"><i class="g2-legend-marker" style="width:10px;height:10px;display:inline-block;margin-right:10px;background-color:' +
                color +
                ';"></i>' +
                '<span class="g2-legend-text">' +
                value +
                "</span></td>" +
                '<td  style="text-align: right;border: none;padding:0;color:#fff;">' +
                // 設置了加上值
                ":" + 
                obj.value +
                "</td>" +
                "</tr>"
              );
            }}
            // 下面這些屬性是屬於定位
            position="right"
            offsetY={-20}
            offsetX={0}
          />
          {/* <Tooltip
            showTitle={false}
            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
          /> */}
          {/* color={['item',['#a4e9ff','#fff675']]} 设置了颜色 */}
          <Geom
            type="intervalStack"
            position="percent"
            color={["item", ["#a4e9ff", "#fff675"]]}
            tooltip={[
              "item*percent",
              (item, percent) => {
                percent = (percent * 100).toFixed(2) + "%";
                return {
                  name: item,
                  value: percent
                };
              }
            ]}
            style={{
              lineWidth: 1,
              stroke: "#fff"
            }}
          >
            {/* 饼状图上显示文字 */}
            {/* <Label
              content="percent"
              offset={-40}
              textStyle={{
                rotate: 0,
                textAlign: "center",
                shadowBlur: 2,
                shadowColor: "rgba(0, 0, 0, .45)"
              }}
            /> */}
          </Geom>
        </Chart>
      </div>
    );
  }
}
export default Accompany;
