import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { Layout, Icon, Avatar, Row, Col, Typography, Alert } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import MyDrawer from "components/common/Drawer";
import LanguageSwitch from "components/common/LanguageSwitch";
import LandingPopup from "components/LandingPopup";
import Download from "./Download";

import user_API from "components/services/userService";

import style from "assets/css/layout.module.scss";

import cookie from "components/utils/cookie";
import { isMobile } from "components/utils/type";

const { Header } = Layout;
const { Text } = Typography;

/**
 * 头部组件
 *    动态渲染 用户名 如果登陆了 就会显示 name
 *    如果没有登录 渲染 登录按钮
 *
 * @export 头部组件
 * @class Header
 * @extends {Component}
 */
class MyHeader extends Component {
  //用户抽屉状态
  state = {
    visible: false,
    studentVisible: false,
    loginVisible: false,
    swapUser: false,
    downloadVisible: sessionStorage.getItem("eviDownload") || "block"
  };

  headerRef = React.createRef();

  //显示用户抽屉
  showDrawer = () => {
    this.setState({
      visible: true
    });
  };
  //关闭用户抽屉
  onClose = () => {
    this.setState({
      visible: false
    });
  };

  setEmptyHeight = () => {
    const height = this.headerRef.current.offsetHeight;
    this.props.setEmptyHeight(height);
  }

  handleClose = () => {
    this.setState({ downloadVisible: "none" });
    sessionStorage.setItem("eviDownload", "none");
  };
    
  componentDidMount() {
    const {
      user,
      user: { type , family , id , display_id },
    } = this.props;
    
    /** 当类型为家长,且子女为0 打开Drawer */
    if (!!id && !cookie.getCookie(`${display_id}-show-parent-manager`)) {
        if (type === "PARENT" && !((user.staff || []).length > 0) && (family.filter(_familyUser => {
            return _familyUser.relation === "CHILD"
        }) || []).length === 0 ) {
           this.setState({ visible: true, swapUser: true });
        }
    }
    this.setEmptyHeight();
  }

  componentDidUpdate (prevProps, prevState) {
    if(prevState.downloadVisible !== this.state.downloadVisible 
      || prevProps.isHealth !== this.props.isHealth
      ) {
      this.setEmptyHeight();
    }
  }

  render() {
    const { locationUrl, translations, route, isHealth } = this.props;
    const { id: uID, img: userAvatar, full_name, type , display_id } = this.props.user;
    const btnStyle = {
      height: "32px",
      padding: "0 16px",
      marginLeft: "0.5rem",
      fontSize: "16px",
      border: "none",
      textAlign: "center"
    };
    const LinkAdapter = !uID || user_API.getType() === "STAFF" ? Link : props => { return <React.Fragment>{props.children}</React.Fragment>; };
   
    return (
      <div ref={this.headerRef} className={style.headerWrap}>
        {!isHealth && (
          <Alert
            message={translations.initDone && intl.get("general.msg.header_busy")}
            type="warning"
            banner
            closable
            onClose={this.props.setHealth}
          />
        )}
        {isMobile() && <Download show={this.state.downloadVisible} onClose={this.handleClose} />}
        <Header className={style.header}>
          <div className={style.inner}>
            <Row
              type="flex"
              align="middle"
              justify="space-between"
              className="header-sm"
            >
              <Col
                xs={0}
                md={5}
                lg={5}
                xl={5}
                style={{ marginRight: "auto", height: 76 }}
              >
                <Link to={locationUrl}>
                  <img
                    src={require("assets/image/logo.png")}
                    alt=""
                    style={{ width: "100%", cursor: "pointer" }}
                  />
                </Link>
              </Col>
              <Col xs={3} sm={2} md={0} style={{ marginRight: "auto" }}>
                <Link to={locationUrl}>
                  <img
                    src={require("assets/image/logo_s.png")}
                    alt=""
                    style={{ width: "100%", cursor: "pointer" }}
                  />
                </Link>
              </Col>
              <Col>
                {/* 家長版or兒童版按鈕 */}
                <LinkAdapter
                  to={ !uID || user_API.getType() === "STAFF"
                      ? `/${route.currentLocation}/${route.currentLanguage.url}/${route.tag === "parent" ? "" : "parent"}`
                      : "#"
                  }
                >
                  <div
                    className={style.btnWidth}
                    style={{ cursor: "pointer", display: "inline-block" }}
                    onClick={() => {
                      if (!uID || user_API.getType() === "STAFF") {
                      } else {
                        this.setState({ visible: true, swapUser: true });
                      }
                    }}
                  >
                    {(!uID || user_API.getType() === "STAFF"
                      ? route.tag === "parent"
                      : type === "PARENT") && (
                      <img
                        style={{ width: "100%" }}
                        src={require(`assets/image/button/kids_${route.currentLanguage.value}.png`)}
                        alt=""
                      />
                    )}
                    {(!uID || user_API.getType() === "STAFF"
                      ? route.tag !== "parent"
                      : type !== "PARENT") && (
                      <img
                        style={{ width: "100%" }}
                        src={require(`assets/image/button/parent_${route.currentLanguage.value}.png`)}
                        alt=""
                      />
                    )}
                  </div>
                </LinkAdapter>
                {/* 内聯網按鈕 */}
                {!!uID && !!user_API.getIntranet() && (
                  <Link
                    to={`/${route.currentLocation}/${route.currentLanguage.url}/intranet`}
                    target="_blank"
                  >
                    <img
                      className={style.btnWidth}
                      src={require(`assets/image/button/intranet_${route.currentLanguage.value}.png`)}
                      alt=""
                    />
                  </Link>
                )}
              </Col>
              {!uID && (
                <React.Fragment>
                  <Col>
                    <LandingPopup
                      ref="LandingPopup"
                      loginpic={route.currentLanguage.value}
                      type={"login"}
                      style={{ ...btnStyle }}
                      closable={true}
                      Modalstyle={{
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "15px 20px"
                      }}
                    />
                  </Col>
                  {/* <Col className={"hidden visible-sm"}> */}
                  <Col span={0}>
                    <LandingPopup
                      ref="LandingPopup"
                      title={
                        translations.initDone &&
                        intl.get("home.publicMsg.header.registerbtn")
                      }
                      type={"register"}
                      style={{ ...btnStyle, background: "#22A3B9" }}
                      width={500}
                      closable={true}
                      Modalstyle={{
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "15px 20px"
                      }}
                      familyToken={
                        (this.props.match &&
                          this.props.match.params.family_token) ||
                        ""
                      }
                    />
                  </Col>
                </React.Fragment>
              )}
              <Col>
                <LanguageSwitch />
              </Col>
              {!!uID && (
                <Col
                  style={{ cursor: "pointer", textAlign: "right" }}
                  onClick={this.showDrawer}
                >
                  <Avatar
                    size="large"
                    src={userAvatar + "?t=" + Math.random() || null}
                    icon={!!userAvatar ? "" : "user"}
                    style={{
                      backgroundColor: !userAvatar ? "#efefef" : "white",
                      color: "black"
                    }}
                  />
                  <div className={"d-inline-flex hidden visible-sm"}>
                    <Text className={style["avatar-text"]}>{full_name}</Text>
                  </div>
                  <Icon
                    className={"d-inline-flex hidden visible-sm"}
                    type="caret-right"
                  />
                </Col>
              )}
            </Row>
          </div>

          {/* 用户抽屉 */}
          <MyDrawer
            visible={this.state.visible}
            onClose={this.onClose.bind(this)}
            locationUrl={locationUrl}
            swapUser={this.state.swapUser}
            swapUserOnClose={() => {
              this.setState({ visible: false, swapUser: false } , () => {
                cookie.setCookie(`${display_id}-show-parent-manager`,true);
              });
            }}
            $location={this.props.$location}
          />
        </Header>
      </div>
    );
  }
}

/** redux 獲得全局數據
 * route  route data (url, language) --暫時沒有用到
 * user  user data (用戶數據)
 */
function mapStateToProps({ auth, route, user, translations }) {
  return { auth, route, user, translations };
}

export default connect(mapStateToProps)(withRouter(MyHeader));
