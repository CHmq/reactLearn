import React, { Component } from 'react';
import { connect } from "react-redux";
import { Row, Col, Spin, Icon } from "antd";
import intl from "react-intl-universal";
import Title from "components/common/Title"
import Adapter from "components/resource/Adapter";
import userLog from "components/services/userLogService.js";
import styleCss from "assets/css/CourseFinish.module.scss"; 
import user from "components/services/userService";
import BGIMG from "assets/image/bg.png";

class AchievementsDetail extends Component {
  state = {
    frishNum: 0,
    allNum: 0,
    backgroundIMG: BGIMG,
    data: [],
    $$loading : true,
  }
  async componentDidMount() {
    const { match : { params : {course_id} } } = this.props;
    this.getChart(course_id);
  }

  getChart = async (course_id) => {
    this.setState({$$loading : true});
    await userLog.chart(course_id, 'DETAIL').then(ret => {
      let frishNum = 0;
      let allNum = 0;
      ret.forEach(ret => {
        allNum += !!ret.item.length ? ret.item.length : (ret.type === "RESOURCE" ? 1 : 0);
        frishNum += ret.type === 'RESOURCE' && ret.is_seen === 'Y' ? 1 : 0;
        ret.item.forEach(item => {
          if(item.is_seen === "Y") frishNum += 1;
        })
      })
      this.setState({
        data: ret,
        frishNum,
        allNum,
        $$loading: false
      })
    }).catch(err => {
      console.log(err);
    })
  }

  componentDidUpdate = async(prevProps) => {
    const { match : { params : {course_id} } } = this.props;
    const { match : { params : {course_id : prevCourseID} } } = prevProps;
    if(!!prevCourseID && !!course_id && (course_id.toString() !== prevCourseID.toString())) {
        this.getChart(course_id);
    }
  }

  render() {
    const { title, picUrl } = JSON.parse(localStorage.getItem('AchieveItem'));
    const style = {
      background: {
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fff",
        backgroundImage: `url(${this.state.backgroundIMG})`
      },
    }
    const { translations } = this.props;
    const { data } = this.state;
    const _fn = function(value) {
      return translations.initDone && intl.get("festival.content."+value)
    }
    const Language = {
      title: _fn("title"),
      Completed:_fn("Completed")
    }

    const list =(length)=>{
      const res = [];
          for(let i = 0; i < 40-length; i++) {
            res.push(
              <Col key={i} xl={5} lg={6} md={8} sm={12} xs={12} style={{marginBottom: 20}} className={styleCss.rCol}>
                <div style={{
                  margin: "0 auto",
                  maxWidth: "100%",
                  height: 120,
                  background: `rgba(0, 0, 0, 0.5) center center`,
                  backgroundSize: 'cover'
                  }}
                  className={styleCss.pic}
                  >
                  <div title="" className={styleCss.mask}>
                    <Icon type="question" className={styleCss.maskIcon}  />
                  </div>
                </div>
              </Col> 
            )
          }
          return res
    }

    return (
      <>
        {!!this.state.$$loading && (
        <div style={{display: 'flex', minHeight: "calc(100vh - 80px - 70px)", alignItems: "center",justifyContent: "center"}}>
          <Spin tip="Loading..." indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />
        </div>)}
        {!this.state.$$loading && (
          <div style={style.background} className={styleCss.CourseFinishWarp}>
            <Row type="flex" justify="space-around" style={{ padding: '40px 0' }}>
            <Col xs={22} md={20} lg={15}>
              <Title logo={picUrl} title={title} tip={`${Language.Completed}：${this.state.frishNum}/${this.state.allNum}`}/>
            </Col>
            <Col xs={22} md={22} lg={19} xl={17} className={styleCss.festival_container}> 
                {data.map(ret => (
                  <Row key={ret.id} className={styleCss.festival_item}>
                    {ret.status === "LOCKED" && user.getType() !== "STAFF" && (
                      <div className={styleCss.locked}>
                        <Icon type="lock" className={styleCss.icon_lock}/>
                      </div>
                    )}
                    <Col xl={6} lg={6} md={7} sm={9} xs={24}
                    className={styleCss.left}>
                      <div style={{
                        background: `url(${ret.file})no-repeat center center`,
                        backgroundSize: 'cover',
                        display: 'flex'
                      }}
                      className={styleCss.pic}
                      >
                        <div title={ret.name} className={styleCss.mask}>{ret.name}</div>
                        {ret.type === "RESOURCE" && ret.is_seen === 'Y' && <img style={{margin: 'auto'}} src={require(`assets/image/head/`+ Math.floor((Math.random()*20)) +`.png`)} alt=""/>}
                      </div>
                    </Col>
                    <Col xl={18} lg={18} md={17} sm={15} xs={24}
                    className={styleCss.right}>
                      <Row gutter={24} type='flex' justify='start'>
                          {!!ret.item && ret.item.map(item => 
                          (<Col xl={5} lg={6} md={8} sm={12} xs={12}
                          key={item.id} style={{marginBottom: 20}} className={styleCss.rCol}>
                            <Adapter course={item}  item={item} info={true} nWindow={true}>
                              <div style={{
                              margin: "0 auto",
                              maxWidth: "100%",
                              height: 120,
                              background: `url(${item.file})no-repeat center center`,
                              backgroundSize: 'cover'
                              }}
                              className={styleCss.pic}
                              >
                                  <div title={item.name} className={styleCss.mask+" " + styleCss[item.is_seen === 'Y' ? "isSeen_mask": ""]}>
                                  {item.is_seen === "Y" ? (
                                    <div>
                                      <img src={require(`assets/image/head/`+ Math.floor((Math.random()*20)) +`.png`)} alt=""/>
                                      <span>{item.name}</span>
                                    </div>
                                    ) : (
                                      <div>
                                        <span>{item.name}</span>
                                      </div>                                    
                                    )}
                                  </div>
                                </div>
                            </Adapter>
                          </Col>))} 
                          {ret.name ==="探索360" ? list(ret.item.length) :""}
                                                                 
                      </Row>
                    </Col>
                  </Row>))}              
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
)(AchievementsDetail);