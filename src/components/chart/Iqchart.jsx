import React, { Component } from 'react';
import {
  Chart,
  Geom,
  Axis,
  Coord,
} from "bizcharts";
import DataSet from "@antv/data-set";

import achieve2_1 from 'assets/image/achieve2_1.png'
import achieve2_2 from 'assets/image/achieve2_2.png'
import achieve2_3 from 'assets/image/achieve2_3.png'
import achieve2_4 from 'assets/image/achieve2_4.png'
import achieve2_5 from 'assets/image/achieve2_5.png'
import achieve2_6 from 'assets/image/achieve2_6.png'
class Iqchart extends Component {
  render() {
    const { DataView } = DataSet;
    // item 就是类名,value 就是值
    const data = [
      {
        item: "A",
        value: 10,
      },
      {
        item: "B",
        value: 60,
      },
      {
        item: "C",
        value: 50,
      },
      {
        item: "D",
        value: 40,
      },
      {
        item: "E",
        value: 60,
      },
      {
        item: "F",
        value: 50,
      },
    ];
    const dv = new DataView().source(data);
    dv.transform({
      type: "fold",
      fields: ["value"],
      // 展开字段集
      key: "user",
      // key字段
      value: "score" // value字段
    });
    const cols = {
      score: {
        min: 0,
        // max: 80,
      },
      tickCount: 0,
      sync: false
    };
    const imageMap = {
      // "Internet Explorer":
      //   achieve2_1,
      A:
        achieve2_1,
      B:
        achieve2_2,
      C:
        achieve2_3,
      D:
        achieve2_4,
      E:
        achieve2_5,
      F:
        achieve2_6
    };
    return (
      <div style={{ paddingTop: '10px' }}>
        {/* padding={'auto'} 可以解决图片填充整个div宽度  */}
        <Chart
          style={{
            // transform: 'rotate(30deg)',            
          }}
          height={160}
          data={dv}
          padding={["auto", 40, "auto", 40]}
          scale={cols}
          forceFit
        >
          {/*radius 放大 取值范围是0-1; rotate:图层旋转30deg */}
          <Coord type="polar" radius={1} rotate={30} />
          {/* 雷達圖角邊上的文字 visible={false} 隱藏信息 */}
          <Axis
            name="item"
            // visible={false}
            line={null}
            tickLine={null}
            grid={{
              lineStyle: {
                lineDash: null
              },
              hideFirstLine: false
            }}
            label={{
              textStyle: {
                fill: 'rgba(0, 0, 0, 0)'
              },
              htmlTemplate(text, item, index) {
                return `
                  <div style="width:1.6rem">
                    <img src=${imageMap[text]} width="100%">
                  </div>
                  `
              }
            }}
          />
          {/* label: 编辑刻度上的字体设置 */}
          <Axis
            name="score"
            line={null}
            tickLine={null}
            label={{
              textStyle: {
                fill: 'rgba(0, 0, 0, 0)'
              },
            }}
            // visible={false}
            grid={{
              type: "polygon",
              lineStyle: {
                lineDash: null,
                stroke: '#d9d9d9', // 网格线的颜色
              },
              // 为网格设置交替的背景色
              alternateColor: ['#fff', '#fff']
            }}
          />
          {/* 颜色填充型 */}
          <Geom type="area" position="item*score" color={'#fff1b2'} />
          {/* 图形的线条 */}
          <Geom type="line" color={'#ffdf63'} position="item*score" size={2} />
          {/* 图形上的小圆点*/}
          <Geom
            type="point"
            position="item*score"
            color={'#ff9226'}
            shape="circle"
            size={4}
            style={{
              stroke: "#fff",
              lineWidth: 1,
              fillOpacity: 1
            }}
          />
        </Chart>
      </div>
    );
  }
}

export default Iqchart;