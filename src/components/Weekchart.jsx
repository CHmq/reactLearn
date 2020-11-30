import React, { Component } from "react";
import { Chart, Geom, Axis, Tooltip } from "bizcharts";

import userLog from "components/services/userLogService";

import styleCss from "assets/css/Weekchart.module.scss";
import user_API from "components/services/userService";

/**
 * 图表组件
 * <Weekchart heigth={默认为180 number类型}/>
 */
class Weekchart extends Component {
  state = {
    data: []
  };
  // 设置默认值
  static defaultProps = {
    height: 240,
    data: [],
    title: "過去7天自學時間",
    min: "分鐘",
    day: "星期"
  };

  async componentDidMount() {
    if(user_API.getStatus() === 'VALID'){
        await userLog
          .weekly()
          .then(ret => {
            // let arr = ["日", "一", "二", "三", "四", "五", "六"];
            let data = [];
            ret.forEach(item => {
              let date = item.date.split('-');
              let num = Number(item.week_day);
              let value = Number(item.duration );
              data.push({ key: num, day: `${date[2]}/${date[1]}`, value  }); 
            });
            // data.sort((a, b) => a.key - b.key);
            this.setState({ data });
          })
          .catch(_msg => {
            console.log(_msg);
          });
    }
  }

  render() {
    const { height, title, min, day } = this.props;
    const { data } = this.state;
    const titleY = {
      autoRotate: false,
      offset: -5,
      textStyle: {
        fontSize: "12",
        // textAlign: 'center',
        fill: "#999",
        fontWeight: "bold"
      }, // 坐标轴文本属性配置
      position: "end"
    };

    const scale = {
      day: {
        alias: day // 为属性定义别名
      },
      value: {
        alias: min // 为属性定义别名
      }
    };
    return (
      <div className={styleCss.weekchartwarp}>
        <Chart
          scale={scale}
          padding={[10, 20, 40, 40]}
          width={100}
          height={height}
          data={data}
          forceFit
        >
          <p className="main-title" style={{ textAlign: "center" }}>
            {title}
          </p>
          {/*visible={false} 设置可以隐藏Y轴的刻度  */}
          <Axis name="value" title={titleY} />
          {/* line="null" 设置可以隐藏X轴的刻度  */}
          <Axis name="day" title={titleY} tickLine="null" 
          label={
            {
            rotate:  data.length > 1 ? 30 : 0,   
            autoRotate: data.length > 1 ? false : true,
            textStyle: data.length > 1 && {
              textAlign: 'start '
            }
            }
          }
          />
          {/* Legend 点击按钮切换 */}
          {/* <Legend/>  */}
          {/* Tooltip 鼠标移动上去可以看到详情 */}
          <Tooltip />
          {/* type 图的类型 */}
          <Geom
            // radius={.8}
            type="interval"
            position="day*value"
            shape="smooth"
            color={[
              "value",
              value => {
                // 当value值大于50进行颜色改变
                if (value >= 50) return "l(90) 0.2:#ffae71 1:#ffe6cf";
                else return "l(90) 0.2:#6a98e2 1:#7edbf8";
              }
            ]}
          />
        </Chart>
      </div>
    );
  }
}

export default Weekchart;
