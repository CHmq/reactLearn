import React, { Component } from "react";
import { Row, Col, Modal, Skeleton } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { Link } from "react-router-dom";

import NewsModal from "components/common/NewsModal";
import LandingBanner from "components/LandingBanner";

import article from "components/services/articleService";
import hotNews from "components/services/hotNewsService";
import jetso from "components/services/jetsoService";
import activity from "components/services/activityService";

import { shuffle } from "components/utils/helper";

import "assets/css/pHome.module.scss";

import banner from "assets/image/parent/banner.jpg";
import banner2 from "assets/image/parent/banner2.jpg";
import img1 from "assets/image/Group 8266.png";
import img2 from "assets/image/Group 8267.png";
import img3 from "assets/image/Group 8268.png";
import img4 from "assets/image/Path 10891.png";
import img5 from "assets/image/efun.png";

const url = `${process.env.REACT_APP_API_URL_PD}`;

class pHome extends Component {
  state = {
    region: this.props.$location,
    lang: this.props.$language.value,
    memu: "ceo",
    articleData: [],
    newsListData: [],
    newsDetail: {},
    topData: {},
    RewardData: {},
    visible: false,
    visible1: false
  };

  async componentDidMount() {
    const { updateFileName } = this.props;
    const { lang } = this.state;
    const { currentLocation : region} = this.props.route;
    const newLang = region === "hk" ? 'zh' : lang;
    if (region === "hk") {
      this.showModal();
    }
    updateFileName("home");
    await article
      .getLatest(newLang)
      .then(ret => {
        this.setState({
          articleData: ret.rows.filter(function(v,index){return index < 3})
        });
      })
      .catch(_msg => {
        //      console.log(_msg);
      });

    await hotNews
      .newsList()
      .then(ret => {
        this.setState({ newsListData: ret.filter((item, index) => index < 4) });
      })
      .catch(_msg => {
        console.log(_msg);
      });

    await activity
      .top()
      .then(ret => {
        this.setState({ topData: ret });
      })
      .catch(_msg => {
        console.log(_msg);
      });

    await jetso
      .getList()
      .then(ret => {
        this.setState({ RewardData: this.RandomNumBoth(ret.rows, 1)[0] });
      })
      .catch(_msg => {
        console.log(_msg);
      });
  }
  //隨機顯示
  RandomNumBoth(arr, maxNum) {
    let _ret = shuffle(arr);
    return _ret.slice(0, maxNum);
  }

  handleClickNewsList = async id => {
    this.setState({ visible: true });
    await hotNews
      .newsDetail(id)
      .then(ret => {
        console.log(ret);
        this.setState({ newsDetail: ret });
      })
      .catch(_msg => {
        console.log(_msg);
      });
  };

  handleClickTop = async id => {
    this.setState({ visible: true });
    await activity
      .info(id)
      .then(ret => {
        console.log(ret);
        this.setState({ newsDetail: ret });
      })
      .catch(_msg => {
        console.log(_msg);
      });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
      newsDetail: {}
    });
  };

  //彈出框
  showModal = () => {
    this.setState({
      visible1: true
    });
  };

  handleOk = e => {
    this.setState({
      visible1: false
    });
  };

  handleCancel1 = e => {
    this.setState({
      visible1: false
    });
  };

  render() {
    const { translations } = this.props;
    const {
      articleData,
      newsListData,
      newsDetail,
      topData,
      RewardData
    } = this.state;
    return (
      <>
        <NewsModal page='landing' />
        <LandingBanner
          img={[
            { file: banner2, link: 'https://www.commchest.org/zh_hk/events/view/147' },
            { file:banner }, 
          ]} 
        />
        <Row className="pHome_container" type="flex" justify="center">
          {/* banner */}
          {/* <Col className="banner_container" span={24}>
            <img src={banner} alt="banner" />
          </Col> */}
          {/* article */}
          <Col
            className="pArticle_container"
            xl={20}
            lg={22}
            md={22}
            sm={22}
            xs={22}
          >
            <Row gutter={20} type="flex" justify="start">
              <Col className="pArticle_pic" xl={7} lg={7} md={9} sm={11} xs={24}>
                <h2>
                  <img src={img1} alt="" height="30px" />
                  &nbsp;{translations.initDone && intl.get("pHome.title.course")}
                </h2>
                <Link to="parent/article">
                  <div className="pArticle_img" 
                  style={{
                    background: `url(${require(`assets/image/parent/ceo_${this.props.$language.value}.png`)})no-repeat center center`, 
                    backgroundSize: 'cover'
                  }}/>
                </Link>
              </Col>
              <Col
                className="pArticle_list"
                xl={17}
                lg={17}
                md={15}
                sm={13}
                xs={24}
              >
                <div style={{ overflow: "hidden" }}>
                  <h2 style={{ float: "left" }}>
                    <img src={img2} alt="" height="30px" />
                    &nbsp;
                    {translations.initDone && intl.get("pHome.title.parentChild")}
                  </h2>
                  <p style={{ float: "right" }}>
                    Powered by{" "}
                    <a href={`${url}`} target="blank">
                      <span style={{ color: "#ff65c2" }}>Parents</span>{" "}
                      <span style={{ color: "#2e89ff" }}>Daily</span>
                    </a>
                  </p>
                </div>
                <Row className="pArticle_list_bg">
                  {!!articleData.length ? (
                    articleData.map(item => (
                      <a
                        href={`${url}/all/${item.id}`}
                        target="blank"
                        key={item.id}
                        style={{ color: "rgba(0, 0, 0, 0.65)" }}
                      >
                        <Col
                          style={{ padding: "0 10px" }}
                          lg={8}
                          md={12}
                          sm={24}
                          xs={24}
                        >
                          <div className="img_Box">
                            <img src={item.thumbnail} alt="" />
                          </div>
                          <div>
                            <p className="list_text">{item.title}</p>
                          </div>
                        </Col>
                      </a>
                    ))
                  ) : (
                    <Skeleton active />
                  )}
                </Row>
              </Col>
            </Row>
          </Col>
          {/* new */}
          <Col className="news_container" xl={20} lg={22} md={22} sm={22} xs={22}>
            <Row gutter={20}>
              <Col className="news_list" lg={8} md={8} sm={12} xs={24}>
                <h2>
                  <img src={img4} height="30px" alt="" />
                  &nbsp;{translations.initDone && intl.get("pHome.title.news")}
                </h2>
                <div className="box">
                  {!!newsListData.length ? (
                    <ul>
                      {newsListData.map(item => (
                        <li
                          key={item.id}
                          onClick={() => this.handleClickNewsList(item.id)}
                        >
                          <i />
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Skeleton active />
                  )}
                </div>
                <Modal
                  width={800}
                  visible={this.state.visible}
                  onCancel={this.handleCancel}
                  footer={null}
                  centered
                  destroyOnClose={true}
                >
                  {!!Object.keys(newsDetail).length ? (
                    <div>
                      <p align="center">
                        <font size="5">
                          {newsDetail.title || newsDetail.name}
                        </font>
                      </p>
                      <div
                        className="dangerously"
                        dangerouslySetInnerHTML={{
                          __html:
                            newsDetail[
                              newsDetail.showtype ? "content" : "details"
                            ]
                        }}
                      />
                    </div>
                  ) : (
                    <Skeleton active paragraph={{ rows: 6 }} />
                  )}
                </Modal>
              </Col>
              <Col lg={8} md={8} sm={12} xs={24}>
                <h2>
                  <img src={img3} height="30px" alt="" />
                  &nbsp;
                  {translations.initDone && intl.get("pHome.title.activity")}
                </h2>
                <div className="box pic_box">
                  {!!Object.keys(topData).length ? (
                    <div onClick={() => this.handleClickTop(topData.id)}>
                      <div className="img_Box pic">
                        <img src={topData.img} alt="" />
                      </div>
                      <span>{topData.name}</span>
                    </div>
                  ) : (
                    <Skeleton active />
                  )}
                </div>
              </Col>
              <Col lg={8} md={8} sm={12} xs={24}>
                <img src={img5} height="45px" alt="" />
                <div className="box pic_box">
                  {!!Object.keys(RewardData).length ? (
                    <a
                      href={`${url}/efunfun/product_info/${RewardData.id}`}
                      target="blank"
                    >
                      <div className="img_Box pic">
                        <img src={RewardData.img} alt="" />
                      </div>
                      <span>{RewardData.name}</span>
                    </a>
                  ) : (
                    <Skeleton active />
                  )}
                </div>
              </Col>
            </Row>
          </Col>
        {/* <Modal
          visible={this.state.visible1}
          footer={null}
          onOk={this.handleOk}
          closable={true}
          onCancel={this.handleCancel1}
        >
        {translations.initDone && intl.getHTML(`general.page.popup`)}
        <br/><br/>
        <img src={require("assets/image/logo.png")} alt='' />
        </Modal> */}
        </Row>
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
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    updateRoute: payload => dispatch({ type: "updateRoute", payload }),
    initUrl: payload => dispatch({ type: "initUrl", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(pHome);
