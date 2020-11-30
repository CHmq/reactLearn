import { getRandom } from "components/utils/helper";
import React, { Component } from 'react';
import { Row, Col, Button, Spin, Icon } from "antd";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import Title from "components/common/Title"
import userLog from "components/services/userLogService.js";

import styleCss from "assets/css/KnowledgeFinish.module.scss"; 
import BGIMG from "assets/image/bg.png"

/**   
 * page name:生活知识完成
 * 
 * */ 
class AchievementsBasic extends Component {
  $$isMount = false;

  state = {
    title: localStorage.getItem('title'),
    frishNum:0, // 已经完成
    allNum:0,// 任务总数
    backgroundIMG:BGIMG,// 页面背景图
    data:[],
    max: 0, // Y轴最大值
    
    $$loading : null,
  }

  async componentDidMount()  {
    this.$$isMount = true;

    const { updateFileName , match : { params : {course_id} } } = this.props;
    updateFileName("home");
    //console.log(course_id);
    this.getChart(course_id);
  }
  
  
  componentDidUpdate = async(prevProps) => {
    const { match : { params : {course_id} } } = this.props;
    const { match : { params : {course_id : prevCourseID} } } = prevProps;
    //console.log(course_id);
    if(!!prevCourseID && !!course_id && (course_id.toString() !== prevCourseID.toString())) {
        this.getChart(course_id);
    }
  }

  componentWillUnmount = async () => {
    this.$$isMount = false;
  }

  getChart = (course_id) => {
      let $$call = userLog.chart(course_id).catch(_err => {
        console.log(_err);
        return [];
      }).then(ret => {
          if(this.state.$$loading !== course_id) {
              throw new Error("NOT_LASTEST_CALL");
          }          
        let frishNum = 0;
        let allNum = 0;
        let data = [];
        let arr = [];
        console.log(ret);
        ret.rows.forEach(i => {
          let value = Number(i.count);
          let name = i.course_name;
          let img = getRandom(10);
          data.push({value, name, img});
          frishNum += value;
          allNum += Number(i.total);
          arr.push(Number(i.total));
        })
        this.setState({'title' : ret.course.name});
        let max = arr.sort((a,b) => b-a)[0];
        if (!!this.$$isMount) this.setState({
          frishNum,
          allNum,
          data,
          max
        });
      return ret;
    }).then(_ret => {
        this.setState({$$loading : null});
    }).catch(_msg => {
      console.log(_msg);
      return [];
    })
    
    this.setState({$$loading : course_id});
    return $$call;
  }

  render() {
    const { locationUrl,translations } = this.props;
    const { picUrl } = JSON.parse(localStorage.getItem('AchieveItem'));
    // const { Header, Footer } = Layout;
    // const style = {
    //   background: {
    //     backgroundRepeat: "no-repeat",
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //     backgroundColor: "#fff",
    //     backgroundImage: `url(${this.state.backgroundIMG})`
    //   },
    //   backgroundItem:{
    //     backgroundImage: `url(${this.state.backgroundIMG})`
    //   }
    // }
    let arrR = ''
    // max 是传递过来的最大值,item是数据(图表的处理)
    const _itemDom  = function(max,item={}) {
      let arr = [];// 存放每一个Y值
      let Max = max; // Y轴的数值 最大值
      let value = item.value || '';// 对应名称 的Y值
      let  img = item.img || ''// 图片
      for(let i = 1;i<=max;i++) {
        arr.push(i)
      }
      arr.reverse() // 数据倒序排序为了下面的Y轴能正常排序显示
      // console.log(arr)
      arrR = arr.map((item,index) =>{
        //   style={{ backgroundImage: (Max-value<=index)?`url(${img})`:''}}
        return <div className={styleCss.item} key={index} >
         {/* 如果没有图片，代表是Y轴的数值显示出来 */}
         {/* Y轴最大值:{Max} 值:{value}  key:{index} */}
         {/* 如果 img 为空则就是Y轴给予显示出遍历（item）1，2，3，4，5，6...的Y值 */}
         {img === ''?item:''} 
         {
           // Max-value<=index 是计算位置给予赋值显示背景图
           Max-value<=index?<img src={require(`assets/image/head/${img}.png`)} style={{height:'90%',maxWidth:'100%'}} alt=""/>:''
         }
        </div>
      }) 
    }

    // 多语言
    const _fn = function(value) {
      return translations.initDone && intl.get("knowledgefinish.content."+value)
    }
    const Language = {
      title: _fn("title"),
      Completed:_fn("Completed"),
      Open:_fn("Open"),
      change:_fn("change"),
      backbtn:_fn("backbtn"),
    }
    return (
      <div className={"d-flex"} style={{minHeight: "calc(100vh - 80px - 70px)", alignItems: "center", justifyContent: "center"}}>
        {!!this.state.$$loading && (<Spin tip="Loading..." indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />)}
        {!this.state.$$loading && (<div style={{ width:"100%"}} className={styleCss.KnowledgeFinishWarp}>
        <Row 
          type="flex"
          justify="space-around"
          >
            <Col xs={22} md={20} lg={15}>
              <Col span={24} style={{display:'flex',flexWrap:'wrap',justifyContent:'center'}}>
                <Col span={24} style={{paddingBottom:'10px'}}>
                  <Title logo={picUrl} title={this.state.title} tip={`${Language.Completed}：${this.state.frishNum}/${this.state.allNum}`}>
                  </Title>
                </Col>
                <Col span={24} className={styleCss.chartwrap}>
                  {/* Y轴显示 */}
                  <div className={styleCss.itemwarp}>
                    {_itemDom(this.state.max)} 
                    {arrR}
                    <div className={`${styleCss.item} ${styleCss.yname}`}></div>
                  </div>
                  {/* 坐标内容 */}
                  {
                    this.state.data.map((item,index)=>{
                      return (
                        <div className={styleCss.itemwarp} key={index}>
                          {_itemDom(this.state.max,item)}
                          {arrR}
                          <div className={`${styleCss.item} ${styleCss.name}`}>{item.name}</div>
                        </div>
                      )
                    })
                  }
                </Col>
                <Col span={24} style={{textAlign:'center',padding:'10px 0'}}>
                  <Button type="primary">
                    <Link to={`${locationUrl}achievements`}>{Language.backbtn}</Link>
                  </Button>
                </Col>
              </Col>
            </Col>
        </Row>
        </div>)}
      </div>
    );
  }
}


function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations
  };
}

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AchievementsBasic);