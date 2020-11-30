import React, { Component } from "react";
import { connect } from "react-redux";
import { Layout, Row, Col, Carousel, Icon, Modal } from "antd";
import intl from "react-intl-universal";
import LandingBanner from "./LandingBanner";

import Video from "components/common/Video";
import NewsModal from "components/common/NewsModal";

import OtherPages from "components/common/contact";
import logoutStyle from "assets/css/logout.module.scss";
import banner from "assets/image/pHome_banner.jpg";

const img = {
  course: [
    "course_01.jpg",
    "course_02.jpg",
    "course_03.jpg",
    "course_04.jpg",
    "course_05.jpg",
  ],
  explore: [
    "explore_01.jpg",
    "explore_02.jpg",
    "explore_03.jpg",
    "explore_04.jpg",
    "explore_05.jpg",
  ],
  festival: [
    "festival_01.jpg",
    "festival_02.jpg",
    "festival_03.jpg",
    "festival_04.jpg",
    "festival_05.jpg",
  ],
  chinese: [
    "chinese_01.jpg",
    "chinese_02.jpg",
    "chinese_03.jpg",
    "chinese_04.jpg",
    "chinese_05.jpg",
  ],
  change: [
    "change_01.jpg",
    "change_02.jpg",
    "change_03.jpg",
    "change_04.jpg",
    "change_05.jpg",
  ],
  story: [
    "story_01.jpg",
    "story_02.jpg",
    "story_03.jpg",
    "story_04.jpg",
    "story_05.jpg",
  ],
  phonics: [
    "phonics_01.jpg",
    "phonics_02.jpg",
    "phonics_03.jpg",
    "phonics_04.jpg",
  ],
};

class Landing extends Component {
  constructor(props) {
    super(props);
    this.props.initRoute(this.getRoute());
    this.state = {
      type: "course",
    };
  }

  componentDidMount() {
    this.props.initRoute(this.getRoute());
    this.props.updateFileName(["home"]);
    const { currentLocation: region } = this.props.route;
    if (region === "hk") {
      this.showModal();
    }
  }

  //彈出框
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
  };

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };

  getRoute = () => {
    let {
      $language: currentLanguage,
      $location: currentLocation,
      $voLanguage: currentVoLanguage,
      $rootURL: locationUrl,
      tag,
      history,
    } = this.props;

    let route = {
      currentLanguage,
      currentLocation,
      currentVoLanguage,
      locationUrl,
      tag: tag,
      history,
    };
    return route;
  };

  createContent = () => {
    const { tag } = this.props;
    // const pages = new Map()
    //   .set("about_us", <About />)
    //   .set("contact_us", <Contact />)
    //   .set("privacy", <Privacy />)
    //   .set("disclaimer", <Disclaimer />);
    return ["about_us", "contact_us", "privacy", "disclaimer"].includes(tag) ? (
      <OtherPages tag={tag} />
    ) : (
      this.createHomeComponents(this.props.translations)
    );
    // return pages.get(tag) || this.createHomeComponents(this.props.translations);
  };

  handleClickChange = (type) => {
    this.setState({ type });
  };

  createHomeComponents = (translations) => {
    const {
      route,
      $language,
      route: { currentLocation },
    } = this.props;
    const isHkOrMo = currentLocation === "hk" || currentLocation === "mo";

    return (
      <React.Fragment>
        <NewsModal page="landing" />
        <LandingBanner
          img={
            isHkOrMo
              ? [
                  {
                    file: require("assets/image/landing_banner_" +
                      $language.value +
                      ".png"),
                  },
                ]
              : [
                  {
                    file: require("assets/image/landing_banner_" +
                      $language.value +
                      ".png"),
                  },
                ]
          }
        />
        {/* 三個色塊 */}
        <div
          style={{
            background: `url(${banner}) center center`,
            backgroundSize: "cover",
            position: "relative",
          }}
        >
          <div className={logoutStyle.mask}></div>
          <Row
            type="flex"
            justify="space-around"
            gutter={32}
            style={{ margin: "0 auto", maxWidth: "1200px" }}
          >
            {[
              { pos: "left", bg: "Path 831.png", img: "Group 595.png" },
              { pos: "middle", bg: "Path 832.png", img: "Group 596.png" },
              { pos: "right", bg: "Path 833.png", img: "Group 598.png" },
            ].map(({ pos, bg, img }) => (
              <Col xs={24} lg={8} key={pos} style={{ maxWidth: "400px" }}>
                <div className={logoutStyle.section}>
                  <img src={require(`assets/image/${img}`)} alt="title" />
                  <h4
                    style={{
                      background: `url(${require(`assets/image/${bg}`)}) no-repeat center center`,
                      backgroundSize: "cover",
                    }}
                  >
                    {translations.initDone &&
                      intl.get(`loading.content.title${pos}`)}
                  </h4>
                  <p>
                    {translations.initDone &&
                      intl.get(`loading.content.content${pos}`)}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
        {/* video */}
        <Row>
          <Col
            span={24}
            className={logoutStyle.video_container}
            style={{ position: "relative" }}
          >
            <div className={logoutStyle.video}>
              <Video
                width={"380px"}
                videosrc={
                  "https://oss-marketing.evigarten.com/evigarten_video/intro_" +
                  `${route.currentLanguage.value}` +
                  ".mp4"
                }
              />
            </div>
          </Col>
        </Row>
        <Row
          type="flex"
          justify="space-around"
          gutter={40}
          style={{
            margin: "50px auto",
            maxWidth: "1200px",
            textAlign: "center",
          }}
        >
          <Col span={24}>
            <h2 style={{ color: "#337992" }}>
              {translations.initDone && intl.get(`general.msg.please_reg`)}
            </h2>
          </Col>
          <Col span={24}>
            {this.props.route.currentLanguage.value === "cn" ? null : (
              <Icon
                type="left"
                theme="outlined"
                onClick={this.handlePrev}
                style={{ left: 0 }}
                className={logoutStyle.Icon}
              />
            )}
            <Carousel ref="img" dots={false} infinite={false}>
              <Row>
                {(this.props.route.currentLanguage.value === "cn"
                  ? [
                      { type: "course", img: "course_new.png" },
                      { type: "explore", img: "course2.png" },
                      { type: "festival", img: "circle icon-1_new.png" },
                      { type: "chinese", img: "circle icon-2.png" },
                      { type: "change", img: "circle icon-5.png" },
                    ]
                  : [
                      { type: "course", img: "course_new.png" },
                      { type: "explore", img: "course2.png" },
                      { type: "festival", img: "circle icon-1_new.png" },
                      { type: "chinese", img: "circle icon-2_new.png" },
                      { type: "change", img: "circle icon-3_new.png" },
                    ]
                ).map(({ img, type }, index) => (
                  <Col
                    xs={4}
                    key={index}
                    style={{ cursor: "pointer" }}
                    className={logoutStyle.selectItem}
                    onClick={() => this.handleClickChange(type)}
                  >
                    <img
                      src={require(`assets/image/${img}`)}
                      style={{ width: "100%" }}
                      alt=""
                    />
                  </Col>
                ))}
              </Row>
              {this.props.route.currentLanguage.value === "cn" ? null : (
                <Row>
                  {[
                    { type: "story", img: "circle icon-4.png" },
                    { type: "phonics", img: "circle icon-5.png" },
                  ].map(({ img, type }, index) => (
                    <Col
                      xs={4}
                      key={index}
                      style={{ cursor: "pointer" }}
                      className={logoutStyle.selectItem}
                      onClick={() => this.handleClickChange(type)}
                    >
                      <img
                        src={require(`assets/image/${img}`)}
                        style={{ width: "100%" }}
                        alt=""
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </Carousel>
            {this.props.route.currentLanguage.value === "cn" ? null : (
              <Icon
                type="right"
                theme="outlined"
                style={{ right: 0 }}
                className={logoutStyle.Icon}
                onClick={this.handleNext}
              />
            )}
          </Col>
          <Col span={24} style={{ padding: 20 }}>
            <h2 style={{ color: "rgba(0, 0, 0, 0.65)" }}>
              {translations.initDone &&
                intl.get(`loading.${this.state.type}.title`)}
            </h2>
            <p style={{ maxWidth: 700, margin: "0 auto" }}>
              {translations.initDone &&
                intl.get(`loading.${this.state.type}.content`)}
            </p>
          </Col>
          {img[this.state.type].map((item, index) => (
            <Col
              xl={4}
              lg={4}
              md={8}
              sm={12}
              xs={12}
              key={index}
              style={{ marginBottom: 20 }}
              className={logoutStyle.Item}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 130,
                  overflow: "hidden",
                }}
              >
                <img
                  style={{
                    width: "100%",
                    height: "auto",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  src={require(`assets/image/landing/${
                    $language.value === "english" ? "en/" : ""
                  }${item}`)}
                  alt=""
                />
              </div>
            </Col>
          ))}
        </Row>
        <Modal
          visible={
            route.tag !== "Register" && this.state.visible && isHkOrMo && false
          }
          footer={null}
          onOk={this.handleOk}
          closable={true}
          onCancel={this.handleCancel}
        >
          {translations.initDone && intl.getHTML(`general.page.popup`)}
          <br />
          <br />
          <img src={require("assets/image/logo.png")} alt="" />
        </Modal>
      </React.Fragment>
    );
  };

  handlePrev = () => {
    this.refs.img.prev(); //ref = img
  };
  handleNext = () => {
    this.refs.img.next();
  };

  render() {
    const { Content } = Layout;
    return <Content>{this.createContent()}</Content>;
  }
}

function mapStateToProps({ route, user, auth, translations }) {
  return {
    route,
    user,
    auth,
    translations,
  };
}

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    initRoute: (payload) => dispatch({ type: "initRoute", payload }),
    updateFileName: (payload) => dispatch({ type: "updateFileName", payload }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
