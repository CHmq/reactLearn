import React from "react";
import {
  Chart,
  Geom,
  Axis,
  Coord,
  Legend,
  Label
} from "bizcharts";
import { Row, Col } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import DataSet from "@antv/data-set";
import "assets/css/logintime.modulle.scss"
class logintime extends React.Component {
  state = {
    // data: [],
    // type: [],
    activeNum:0,
  }
  _btnactive(index, type) {
    this.setState({
      activeNum:index,
    })
    this.props.select(type);
  }
  render() {
    const { translations, data, type } = this.props;
    // console.log(data);
    // console.log(type);
    const { DataView } = DataSet;
    const dv = new DataView();
    dv.source(data).transform({
      type: "fold",
      fields: type,
      key: "opinion",
      value: "value",
      // retains: ["group", "type"]
    });

    // // 设置导航条颜色
    // const colorMap = {
    //   "節日": "#4ec0ff",
    //   "語文(中文)": "#ff7474",
    //   "朱": "#ffc266",
    //   "校本課程":"#79f4b2",
    // };

    // 多语言
    const _fn = function(value) { 
      return translations.initDone && intl.get('achievements.content.Logintime.'+value)
    }
    // id 作用 给予每个btn 一个id标识
    const Language = [{
      id:1, 
      name:_fn("today"),
      type: "DAY"
    },{
      id:2,
      name:_fn("week"),
      type: "WEEK"
    },{
      id:3,
      name:_fn("month"),
      type: "MONTH"
    }]

    return (
      <div className="logintimewarp">
        <Chart padding="auto" height={100} data={dv} forceFit>
          {/* Y轴 */}
          <Axis name="type" visible={false} title={null} labelOffset={0} /> 
           {/* X轴 */}
          <Axis
            name="value"
            label={{
              textStyle: {
                fill: 'rgba(0, 0, 0, 0)'
              }
            }}
            position="right"
            // formatter={function(val) {
            //   return val + "%";
            // }}
          />
          <Coord transpose />
          {/* <Tooltip /> */}
          <Legend/>
          <Geom
            type="intervalStack"
            position="type*value"
            color={["opinion"]}
            opacity={0.8}
          >
             {/* <Label content="type" offset={-30} /> */}
             <Label
              content="value"
              offset={0}
              // formatter 转换格式
              // formatter={function(val) {
              //   return val + "%";
              // }}
              htmlTemplate={(text, item, index)=>{
                // text 为每条记录 x 属性的值
                // item 为映射后的每条数据记录，是一个对象，可以从里面获取你想要的数据信息
                // index 为每条记录的索引
                // var point = item.point; // 每个弧度对应的点
                // var percent = point['percent'];
                // percent = (percent * 100).toFixed(2) + '%';
                // 自定义 html 模板
                return `<div class="itemwarp">
                  <div class="main">${text}</div>
                  <div class="bubbleTail"></div>
                <div>`;
              }}
            />
          </Geom>
        </Chart>
        {/* {this.props.children} */}
        <Row type="flex" justify="center">
          <Col span={23} className="btnwarp">
            {
              Language.map((item,index)=>{
                return (<div key={index} className={`${this.state.activeNum === index?'active':''} btn`} onClick={()=>this._btnactive(index, item.type)}>{item.name}</div>)
              })
            }
          </Col>
        </Row>
      </div>
    );
  }
}


/** redux 獲得全局數據
 * route  route data (url, language) --暫時沒有用到
 * user  user data (用戶數據)
 */


function mapStateToProps({ translations }) {
  return {
    translations
  };
}

export default connect(mapStateToProps)(logintime);