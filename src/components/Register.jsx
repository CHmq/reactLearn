import React, { Component } from "react";
import { Tabs, Icon, Row, Col, Steps } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import { setRegistertKey } from "components/actions/auth_action";

import Registration from "./Registration";
import Verify from "./Verify";
import styleCss from "assets/css/Register.module.scss";
const { TabPane } = Tabs;
const { Step } = Steps;
/**
 * 注册页面组件
 *  */
class Register extends Component {
  $$tab = null;

  state = {
    current: 0, //步驟條狀態
    token: null, //注冊后的token值
    result: 0, //0顯示注冊，1顯示驗證
    width: 0, // 获取屏幕宽度
    defaultKey: "1"
  };

  constructor(props) {
    super(props);
    this.$$tab = React.createRef();
  }

  componentDidMount() {
    this.setState({
      current: this.props.result || 0,
      result: this.props.result || 0,
      width: window.screen.width
    });
    const { updateFileName } = this.props;
    updateFileName("home");

    if (!!this.props.user) {
      this.setState({
        defaultKey: !!this.props.user.tel ? "2" : "1"
      });
    }
  }
  //改變步驟條狀態
  changeCurrent = num => {
    this.setState({
      current: num
    });
  };

  //接收注冊組件傳過來的值
  sonValue(result) {
    console.log(result);
    this.setState({
      result
    });
  }
  //每次切換tab，都顯示注冊
  changeTab(tab) {
    this.props.RD_setRegistertKey(tab);
    this.setState({
      defaultKey: tab,
      result: 0
    });
  }

  createTabs = width => {
    let tabPosition = "top";

    return (
      <Tabs
        ref={this.$$tab}
        onChange={this.changeTab.bind(this)}
        defaultActiveKey={this.props.auth.key || this.props.key}
        activeKey={this.props.auth.key || this.state.defaultKey}
        tabPosition={tabPosition}
        tabBarGutter={27}
      >
        <TabPane
          tab={
            <span>
              <Icon type="mail" />
              {this.props.translations.initDone &&
                intl.get("loading.publicMsg.register.type.email")}
            </span>
          }
          disabled={!!this.state.result}
          key="1"
        >
          {this.state.result ? (
            <Verify
              change={num => {
                this.changeCurrent(num);
              }}
              prev={() => this.setState({ current: 0, result: 0 })}
            />
          ) : (
            <Registration
              pageKey={this.props.pageKey}
              defaultKey={this.state.defaultKey}
              type={"email"}
              change={num => {
                this.changeCurrent(num);
              }}
              data={result => {
                this.sonValue(result);
              }}
              familyToken={this.props.familyToken}
            />
          )}
        </TabPane>
        <TabPane
          tab={
            <span>
              <Icon type="phone" />
              {this.props.translations.initDone &&
                intl.get("loading.publicMsg.register.type.phone")}
            </span>
          }
          disabled={!!this.state.result}
          key="2"
        >
          {this.state.result ? (
            <Verify
              change={num => {
                this.changeCurrent(num);
              }}
              prev={() => this.setState({ current: 0, result: 0 })}
            />
          ) : (
            <Registration
              pageKey={this.props.pageKey}
              defaultKey={this.state.defaultKey}
              type={"tel"}
              change={num => {
                this.changeCurrent(num);
              }}
              data={result => {
                this.sonValue(result);
              }}
              familyToken={this.props.familyToken}
            />
          )}
        </TabPane>
      </Tabs>
    );
  };

  // 自适应调整页面
  _html(width) {
    //let tabPosition = width > 500 ? "left" : "top";
    const {
      auth: { key, userState, kid_token }
    } = this.props;

    const view = new Map()
      .set(
        "1",
        this.state.result ? (
          <Verify
            change={num => {
              this.changeCurrent(num);
            }}
            prev={() => this.setState({ current: 0, result: 0 })}
          />
        ) : (
          <Registration
            pageKey={this.props.pageKey}
            defaultKey={this.state.defaultKey}
            type={"email"}
            change={num => {
              this.changeCurrent(num);
            }}
            data={result => {
              this.sonValue(result);
            }}
            familyToken={this.props.familyToken}
          />
        )
      )
      .set(
        "2",
        this.state.result ? (
          <Verify
            change={num => {
              this.changeCurrent(num);
            }}
            prev={() => this.setState({ current: 0, result: 0 })}
          />
        ) : (
          <Registration
            pageKey={this.props.pageKey}
            defaultKey={this.state.defaultKey}
            type={"tel"}
            change={num => {
              this.changeCurrent(num);
            }}
            data={result => {
              this.sonValue(result);
            }}
            familyToken={this.props.familyToken}
          />
        )
      );
    return kid_token && userState === "register"
      ? view.get(key)
      : this.createTabs(width);
  }

  render() {
    const style = {
      textAlign: "center",
      marginBottom: "30px"
    };
    const { translations } = this.props;
    // 多语言
    const _fn = function(value, variable = null) {
      return (
        translations.initDone &&
        intl.get("loading.publicMsg.register." + value, variable)
      );
    };
    const Language = {
      code: _fn("procedure.code"),
      verify: _fn("procedure.verify"),
      done: _fn("procedure.done")
    };
    return (
      <Row type="flex" justify="center">
        <Col xs={24} md={16} style={style}>
          <img
            src={require("assets/image/logo.png")}
            alt=""
            style={{
              width: "100%",
              cursor: "pointer",
              margin: "17px 0"
            }}
          />
        </Col>
        <Col
          lg={24}
          md={21}
          sm={23}
          xs={23}
          style={{ marginBottom: 20 }}
          className={styleCss.flex}
        >
          <Steps
            size="small"
            current={this.state.current}
            className={styleCss.flex}
          >
            <Step title={Language.code} />
            <Step title={Language.verify} />
            <Step title={Language.done} />
          </Steps>
        </Col>
        <Col lg={24} md={21} sm={23} xs={23}>
          {this._html(this.state.width)}
        </Col>
      </Row>
    );
  }
}
function mapStateToProps({ auth, route, user, translations }) {
  return {
    auth,
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
    initRoute: payload => dispatch({ type: "initRoute", payload }),
    initUserData: payload => dispatch({ type: "INIT", payload }),
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload }),
    RD_setRegistertKey: key => dispatch(setRegistertKey(key))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Register);
