import React, { Component } from "react";
import { Row, Col, Button, Icon, Modal, Radio, Spin } from "antd";

import { connect } from "react-redux";
import intl from "react-intl-universal";

import Achieve from "./Achieve";
import DraggerImgUploading from "components/common/UploadingAvatar";
import Achievecard from "components/common/Achievecard";
// import Popup from "components/common/Popup";
import Love from "components/common/LoveNum";
import Iqchart from "components/chart/Iqchart";
import Logintime from "components/chart/logintime";
// import PopupAchieve from "./PopupAchieve";
import ImgPreview from "components/common/ImgPreview";

import userLog from "components/services/userLogService";
import userJoinLog from "components/services/userJoinLogService";
import user_API from "components/services/userService";

import card from "assets/css/achievecard.module.scss";
import "assets/css/Achievement.module.scss";

// import img1 from "assets/image/achievement_01.png";
import img2 from "assets/image/achievement_02.png";
// import img3 from "assets/image/achievement_03.png";

import Logo from "assets/image/logo_s.png";

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

/**
 * 成就页面
 *
 * @export 成就页面
 * @class Achievement
 * @extends {Component}
 */

class Achievement extends Component {
  $$isMount = false;

  state = {
    time: 0,
    timeData: [],
    timeType: [],
    timeSpin: true,
    bindFamily: false,
    visible: false,
    watchvisible: false,
    achvisible:false,
    loveData:[],
    genCertJob: [],
    radio: 'WEEK',
    num: 0,
    DONE: false,
  };

  async componentDidMount() {
    this.$$isMount = true;
    const { updateFileName } = this.props;
    updateFileName("home");

    //親子關係數據
    await userJoinLog
      .getChart()
      .then((ret) => {
        let num = 0;
        ret.forEach((item) => {
          if (item.type === this.state.radio) num = Number(item.point);
        });
        if (!!this.$$isMount) this.setState({ loveData: ret, num });
      })
      .catch((_msg) => {
        console.log(_msg);
      });

    this.getTimeData();
  }

  //今日使用时间数据
  getTimeData = async (type = "DAY") => {
    this.setState({ timeSpin: true });
    await userLog
      .daily(type)
      .then((ret) => {
        let typeArr = [];
        let obj = {};
        let dataArr = [];
        let num = 0;
        console.log(ret);
        ret.forEach((item) => {
          typeArr.push(item.course_name);
          obj[item.course_name] = Number(item.duration);
          num += Number(item.duration);
        });
        dataArr.push(obj);
        if (!!this.$$isMount)
          this.setState({
            timeData: dataArr,
            timeType: typeArr,
            time: num,
            timeSpin: false,
          });
      })
      .catch((_msg) => {
        console.log(_msg);
        this.setState({ timeSpin: false, timeData: [], time: 0 });
      });
  };

  componentWillUnmount = async () => {
    this.$$isMount = false;
  };

  // showModal = () => {
  //   this.setState({
  //     visible: true,
  //   });
  // };
  watchModal = () => {
    this.setState({
      watchvisible: true,
    });
  };
  achModal = () => {
    this.setState({
      achvisible: true,
    });
  };

  onCancel = () => {
    this.setState({
      visible: false,
      watchvisible: false,
      achvisible: false,
    });
  };

  setBindFamily = (bindFamily) => {
    this.setState({ bindFamily });
  };

  createModal = (title = "") => {
    return (
      <Modal
        title={title}
        centered
        bodyStyle={{ backgroundColor: "#fff" }}
        visible={this.state.bindFamily}
        onCancel={() => this.setBindFamily(false)}
        footer={null}
        maskClosable={false}
      >
        <DraggerImgUploading />
      </Modal>
    );
  };

  ShowUploading = () => {
    this.setBindFamily(true);
  };

  handleClickLink = (title, id) => {
    localStorage.setItem("title", title);
    localStorage.setItem("course_id", id);
  };

  radioChange = (e) => {
    let num = 0;
    const value = e.target.value;
    this.setState({ radio: value });
    this.state.loveData.forEach((item) => {
      if (item.type === value) {
        num = Number(item.point);
        this.setState({ num });
      }
    });
  };
  // 取得證書
  genCertJob = () => {
    if (this.state.medal) {
      userLog.genCertJob().then((ret) => {
        this.setState({ genCertJob: ret });
        this.onRefresh();
      });
    }
  };
  // 取得證書 圖片預覽刷新
  onRefresh = () => {
    userLog.getByUser().then((ret) => {
      if (ret.status === "DONE") {
        this.setState({ loadStatus: true });
      }
    });
  };

  achieveCallback = (medal) => {
    this.setState({ medal });
  };

  render() {
    const { time, timeData, timeType, timeSpin } = this.state;
    const { locationUrl, translations, route } = this.props;
    const { img: userAvatar, full_name, intranet } = this.props.user;

    // const text = "世衛建議2-5嵗幼兒每日看屏幕時間不應超過一個小時";
    // 多语言
    const _fn = function (value) {
      return translations.initDone && intl.get("achievements.content." + value);
    };
    const Language = {
      titleImg: _fn("titleImg"),
      titlerelationship: _fn("titlerelationship"),
      titleTime: _fn("titleTime"),
      min: _fn("min"),
      week: _fn("week"),
      month: _fn("month"),
      titleAbility: _fn("titleAbility"),
      nowatch: _fn("nowatch"),
      lesshalfwatch: _fn("lesshalfwatch"),
      halfmorewatch: _fn("halfmorewatch"),
      fullwatch: _fn("fullwatch"),
      medal: _fn("medal"),
      bronzeMedal: _fn("bronzeMedal"),
      silverMedal: _fn("silverMedal"),
      goldMedal: _fn("goldMedal"),
      diamond: _fn("diamond"),
      genCertJob: _fn("gen_cert_job"),
    };
    return (
      <Row type="flex" justify="space-around" style={{ paddingTop: 20 }}>
        <Col xs={22} md={20} lg={16}>
          <Row gutter={18}>
            {/* 個人信息 */}
            <Col xs={24} sm={12} xl={6}>
              <Achievecard
                bigname={full_name}
                address={
                  !!intranet &&
                  !!intranet.school["name_" + route.currentLanguage.value]
                    ? intranet.school["name_" + route.currentLanguage.value]
                    : null
                }
                width="100%"
                className="usercard"
              >
                <div className={card.user}>
                  <div className={card.usermain}>
                    <div className={card.userimg}>
                      <img
                        src={userAvatar || img2}
                        alt=""
                        className={card.img}
                        onClick={this.ShowUploading}
                      />
                      <div className={card.Identity}>
                        <div className={card.Circle}>
                          <img
                            src={
                              !!intranet &&
                              !!intranet.school_info &&
                              !!intranet.school_info.logo
                                ? intranet.school_info.logo
                                : Logo
                            }
                            alt=""
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.createModal(Language.titleImg)}
                </div>
              </Achievecard>
            </Col>
            {/* 親子關係 */}
            <Col xs={24} sm={12} xl={6}>
              <Achievecard width="100%" className="numbercard">
                <div className={card.number}>
                  <Row style={{ height: "100%" }}>
                    <Col span={22}>
                      <h1 style={{ margin: 0, color: "#f3fbfa" }}>
                        {Language.titlerelationship}
                      </h1>
                    </Col>
                    <Col span={2}>
                      <Button
                        className={card.TooltipBtn}
                        onClick={this.watchModal}
                      >
                        <Icon type="question" />
                      </Button>
                      <Modal
                        visible={this.state.watchvisible}
                        footer={null}
                        onOk={this.handleOk}
                        closable={true}
                        onCancel={this.onCancel}
                        style={{ maxWidth: 500 }}
                        bodyStyle={{
                          background: "#fa96a3",
                          color: "#fff",
                          fontSize: "16px",
                          lineHeight: "40px",
                        }}
                      >
                        <Row>
                          <Col sm={8}>{Love(0)}</Col>
                          <Col sm={16}>
                            <p>{Language.nowatch}</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={8}>{Love(1)}</Col>
                          <Col sm={16}>
                            <p>{Language.lesshalfwatch}</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={8}>{Love(2)}</Col>
                          <Col sm={16}>
                            <p>{Language.halfmorewatch}</p>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={8}>{Love(3)}</Col>
                          <Col sm={16}>
                            <p>{Language.fullwatch}</p>
                          </Col>
                        </Row>
                      </Modal>
                    </Col>
                    <Col span={24} style={{ display: "flex" }}>
                      {Love(this.state.num)}
                    </Col>
                    <Col span={24} className={card.btn_container}>
                      <Radio.Group
                        defaultValue="WEEK"
                        buttonStyle="solid"
                        onChange={this.radioChange}
                      >
                        <Radio.Button
                          value="WEEK"
                          className={
                            this.state.radio === "WEEK" ? card.btn_week : ""
                          }
                        >
                          {Language.week}
                        </Radio.Button>
                        <Radio.Button
                          value="MONTH"
                          className={
                            this.state.radio === "MONTH" ? card.btn_week : ""
                          }
                        >
                          {Language.month}
                        </Radio.Button>
                      </Radio.Group>
                    </Col>
                  </Row>
                </div>
              </Achievecard>
            </Col>
            {/* 今日登入时间 */}
            <Col xs={24} sm={12} xl={6}>
              <Achievecard width="100%" className="timecard">
                <div className={card.time}>
                  <h1 style={{ margin: 0, color: "#f3fbfa" }}>
                    {Language.titleTime}
                  </h1>
                  <Spin indicator={antIcon} spinning={timeSpin}>
                    <h2 style={{ color: "#f3fbfa" }}>
                      <span>{Math.ceil(time)}</span> {Language.min}
                    </h2>
                    <div style={{ paddingTop: "10px" }}>
                      <Logintime
                        data={timeData}
                        type={timeType}
                        select={(type) => this.getTimeData(type)}
                      />
                    </div>
                  </Spin>
                </div>
              </Achievecard>
            </Col>
            {/* 雷達圖 */}
            <Col xs={24} sm={12} xl={6}>
              <Achievecard title={Language.titleAbility} width="100%">
                <div className={card.ability}>
                  <Iqchart style={{ backgroundColor: "#ccc" }} />
                  <Button
                    // onClick={this.showModal}
                    className={card.TooltipBtn}
                  >
                    <Icon type="question" />
                  </Button>
                </div>
                {/* <Popup
                      width={580}
                      onCancel={this.onCancel}
                      visible={this.state.visible}
                    >
                      <PopupAchieve data={list} />
                    </Popup> */}
              </Achievecard>
            </Col>
          </Row>
        </Col>
        <Col className="achieve" xs={22} md={20} lg={16}>
          <img
            className="title"
            src={require("assets/image/achieve_title" +
              (route.currentLanguage.value === "english" ? "_en" : "") +
              ".png")}
            alt="title"
          />
          <div className="modalIcon">
            <Button onClick={this.achModal} className="modalbtn">
              <Icon type="question" />
            </Button>
            <Modal
              title={Language.medal}
              visible={this.state.achvisible}
              footer={null}
              onOk={this.handleOk}
              closable={true}
              onCancel={this.onCancel}
              style={{ maxWidth: 400 }}
            >
              <Row className="Icon">
                <Col xs={18}>
                  <h3>{Language.diamond}</h3>
                </Col>
                <Col xs={6}>
                  <img
                    src={require(`assets/image/achievement_04.png`)}
                    alt=""
                  />
                </Col>
                <Col xs={18}>
                  <h3>{Language.goldMedal}</h3>
                </Col>
                <Col xs={6}>
                  <img
                    src={require(`assets/image/achievement_03.png`)}
                    alt=""
                  />
                </Col>
                <Col xs={18}>
                  <h3>{Language.silverMedal}</h3>
                </Col>
                <Col xs={6}>
                  <img
                    src={require(`assets/image/achievement_02.png`)}
                    alt=""
                  />
                </Col>
                <Col xs={18}>
                  <h3>{Language.bronzeMedal}</h3>
                </Col>
                <Col xs={6}>
                  <img
                    src={require(`assets/image/achievement_01.png`)}
                    alt=""
                  />
                </Col>
              </Row>
            </Modal>
          </div>
          {user_API.getType() === "STUDENT" && false && (
            <div style={{ textAlign: "right", marginTop: -30 }}>
              <ImgPreview
                data={[this.state.genCertJob]}
                loadStatus={this.state.loadStatus}
                onRefresh={this.onRefresh}
                onClose={() => this.setState({ loadStatus: false })}
                medal={this.state.medal}
              >
                <img
                  src={require(`assets/image/achievement/button_cert_${route.currentLanguage.value}.png`)}
                  onClick={this.genCertJob}
                  style={{ maxWidth: 250 }}
                  alt="preview"
                />
              </ImgPreview>
            </div>
          )}
          <Row gutter={20} style={{ textAlign: "center", marginTop: 20 }}>
            <Achieve
              url={locationUrl}
              lg={6}
              md={8}
              sm={12}
              xs={12}
              styles={"achievePage"}
              callback={(medal) => this.achieveCallback(medal)}
            />
          </Row>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations,
  };
}

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: (payload) => dispatch({ type: "updateFileName", payload }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Achievement);
