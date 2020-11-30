// import { getRandom } from "components/utils/helper";
import React, { Component } from 'react';
import Title from "components/common/Title"
import { Row, Col, Button, Spin, Icon } from "antd";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import userLog from "components/services/userLogService.js";

import styleCss from "assets/css/CourseFinish.module.scss"; 
import BGIMG from "assets/image/bg.png";
import circleB from "assets/image/CircleB.png";
import circleG from "assets/image/CircleG.png";
import circleR from "assets/image/CircleR.png";

/**   
 * page name:生活知识
 * 
 * */ 
class AchievementsSchool extends Component {
  $$isMount = false;
  state = {
    frishNum:0,
    allNum:0,
    backgroundIMG:BGIMG,// 页面背景图
    itemData:[],
    $$loading : true
  }

  async componentDidMount() {
    this.$$isMount = true;
    const { updateFileName } = this.props;
    updateFileName("home");

    await userLog.chart('SCHOOL').then(ret => {
      console.log(ret);
      let data = [];
      let frishNum = 0;
      let allNum = 0;
      ret.rows.forEach(item => {
        frishNum += Number(item.count);
        allNum += Number(item.total);
      });
      for(let i=0; i<frishNum; i++){
        data.push({img:require(`assets/image/head/${i % 19}.png`)})
      }
      for(let i=0; i<allNum - frishNum; i++){
        data.push({});
      }
      if (!!this.$$isMount) this.setState({
        itemData: data,
        frishNum,
        allNum,
        $$loading: false
      })
      console.log(this.state.itemData);
    }).catch(_msg => {
      console.log(_msg);
    })
  }

  componentWillUnmount = async () => {
    this.$$isMount = false;
  }

  genIMg = (index) => {
    let mapping = [
      `${circleB}`,
      `${circleG}`,
      `${circleR}`,
    ];
    return mapping[(index % mapping.length)];
  }
  
  render() {
    const { locationUrl,translations } = this.props;
    const { picUrl } = JSON.parse(localStorage.getItem('AchieveItem'));
    const style = {
      background: {
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fff",
        backgroundImage: `url(${this.state.backgroundIMG})`
      },
    }

        // 多语言
        const _fn = function(value) {
          return translations.initDone && intl.get("coursefinish.content."+value)
        }
        const Language = {
          title: _fn("title"),
          Completed:_fn("Completed"),
          backbtn:_fn("backbtn"),
        }
    return (
      <>
        {!!this.state.$$loading && (
          <div style={{display: 'flex', minHeight: "calc(100vh - 80px - 70px)", alignItems: "center",justifyContent: "center"}}>
            <Spin tip="Loading..." indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />
        </div>)}
        {!this.state.$$loading && (
          <div style={style.background} className={styleCss.CourseFinishWarp}>
            <Row 
              type="flex"
              justify="space-around"
              style={{ padding: '40px 0' }}>
                <Col xs={22} md={20} lg={15}>
                  {/* 主体内容 */}
                  <Col span={24} style={{display:'flex',flexWrap:'wrap',justifyContent:'center'}}>
                    <Col span={24}>
                      <Title logo={picUrl} title={Language.title} tip={`${Language.Completed}：${this.state.frishNum}/${this.state.allNum}`}></Title>
                    </Col>
                    <Col span={24} className={styleCss.blackboardHeader}></Col>
                    <Col span={22} style={{display:'flex',alignItems:'center',justifyContent: 'center'}}>
                      <Row 
                        gutter={10}
                        style={{width: '100%', padding: '0 30px'}}
                        type="flex"
                        className={styleCss.blackboard}>
                        {
                          this.state.itemData.map((item,index)=>{
                            return (
                              <Col xs={6} sm={4} md={3} xl={3}  key={index} className={styleCss.item}>
                                <img 
                                className={styleCss.circle} 
                                src={this.genIMg(index)} 
                                alt=""/>
                                <img className={styleCss.avatar} src={item.img} alt=""/>
                              </Col>
                            )
                          })
                        }
                      </Row>
                    </Col>
                    <Col span={24} className={styleCss.blackboardFooder}></Col>
                    <Col span={24} style={{textAlign:'center'}}>
                      <Button type="primary">
                        <Link to={`${locationUrl}achievements`}>{Language.backbtn}</Link>
                      </Button>
                    </Col>
                  </Col>
                </Col>
            </Row>
          </div>
        )}
      </>
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
)(AchievementsSchool);