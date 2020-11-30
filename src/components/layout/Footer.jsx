import React, { Component } from "react";
import { Menu, Row, Col, Layout } from "antd";
import { connect } from "react-redux";

import { Link } from "react-router-dom";

import intl from "react-intl-universal";
import style from "assets/css/layout.module.scss";

import user_API from "components/services/userService";

const { Footer } = Layout;

class MyFooter extends Component {
  render() {
    const { translations, route } = this.props;
    const { id: uID } = this.props.user;
    const _selectKey = [`${route.tag}`];

    return (
      <Footer className={style.footer}>
        <Row type="flex" align="middle" justify="end">
          <Col xs={{ span: 24 }} style={{ textAlign: "right" }}>
            <Col sm={0} xs={0} md={24} style={{ position: "fixed", zIndex: "2", right: "30px", width: 133, bottom: "100px" }}>
              {!!uID && !!user_API.getIntranet() && user_API.getType() === "STUDENT" && (
                <Link
                  to={`/${route.currentLocation}/${route.currentLanguage.url}/fishgame`}
                  target="_blank"
                >
                  <img
                    src={require(`assets/image/fishgame/fish_${route.currentLanguage.value}.png`)}
                    alt=""
                  />
                </Link>
              )}
            </Col>
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={_selectKey}
              style={{ lineHeight: "64px" }}
            >
              <Menu.Item key="about_us">
                <Link to={`/${route.currentLocation}/${route.currentLanguage.url}/about_us`} >
                  {translations.initDone &&
                    intl.get("home.publicMsg.footer.about")}
                </Link>
              </Menu.Item>
              <Menu.Item key="contact_us">
                <Link to={`/${route.currentLocation}/${route.currentLanguage.url}/contact_us`}>
                  {translations.initDone &&
                    intl.get("home.publicMsg.footer.liaison")}
                </Link>
              </Menu.Item>
              <Menu.Item key="privacy">
                <Link to={`/${route.currentLocation}/${route.currentLanguage.url}/privacy`}>
                  {translations.initDone &&
                    intl.get("home.publicMsg.footer.agreement")}
                </Link>
              </Menu.Item>
              <Menu.Item key="disclaimer">
                <Link to={`/${route.currentLocation}/${route.currentLanguage.url}/disclaimer`}>
                  {translations.initDone &&
                    intl.get("home.publicMsg.footer.Disclaimer")}
                </Link>
              </Menu.Item>
            </Menu>
          </Col>
        </Row>
        <Row style={{ color: "#555555", backgroundColor: "#cbcbcb" }}>
          {!!process.env.REACT_APP_CN_ICP_PAYMENT && (<Col xs={{ span: 24 }} style={{ textAlign: "center" }} >
            <p style={{ margin: 0 }}><small><strong>{process.env.REACT_APP_CN_ICP}</strong></small></p>
            <p style={{ margin: 0 }}><small><strong>{process.env.REACT_APP_CN_ICP_PAYMENT}</strong></small></p>
          </Col>)}
          <Col xs={{ span: 24 }} style={{ textAlign: "center" }} >
            <small><strong>{process.env.REACT_APP_COPYRIGHT} ( {process.env.REACT_APP_LOCATION} v{process.env.REACT_APP_VERSION} )</strong></small>
          </Col>
        </Row>
      </Footer>
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

export default connect(mapStateToProps)(MyFooter);
