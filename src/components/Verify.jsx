import React, { Component } from "react";
import { Form, Button, Input, Row, Col, message } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import auth from "./services/authService";

/**
 * 验证页面
 *
 * @export 验证页面
 * @class verify
 * @extends {Component}
 */
class Verify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 60, //时间初始化
      liked: true, //获取验证码文案
      loading: false
    };
  }

  componentDidMount() {
    //界面渲染就開始倒計時
    this.countDown();
  }

  //验证状态是否1
  async verifyRegister() {
    const { kid_token } = this.props.auth;
    const value = this.props.form.getFieldsValue();
    const { translations } = this.props;
    this.setState({loading: true});
    await auth
      .verify(value.captcha, kid_token)
      .then(ret => {
        console.log(ret);
        this.props.change(3);
        message.success(
          translations.initDone && intl.get(`general.msg.reg_success`)
        );
        this.setState({loading: false});
        setTimeout(function() {
          window.location.href = "/";
        }, 1000);
      })
      .catch(_msg => {
        message.error("這是一個未驗證的狀態");
        this.setState({loading: false});
      });
  }

  //提交验证码
  handleSubmit = e => {
    e.preventDefault();
    this.verifyRegister();
  };

  //重发验证码
  async resend() {
    const res = await auth.resend();
    console.log(res);
  }

  //倒計時
  countDown = () => {
    let timer = setInterval(() => {
      this.setState(
        {
          liked: false,
          seconds: this.state.seconds - 1
        },
        () => {
          if (this.state.seconds === 0) {
            clearInterval(timer);
            this.setState({
              liked: true,
              seconds: 60
            });
          }
        }
      );
    }, 1000);
  };

  // 获取并等待60秒验证码
  sendCode = () => {
    this.setState({
      liked: false
    });
    this.resend();
    this.countDown();
  };

  //提交按鈕默認禁用
  vaIidate = () => {
    const { getFieldsValue, getFieldsError } = this.props.form;
    const value = getFieldsValue(["captcha"]);
    const error = getFieldsError(["captcha"]);
    return !value.captcha || error.captcha ? true : false;
  };

  // 清除 setState 异步调用
  componentWillUnmount() {
    this.setState = state => {
      return;
    };
  }

  render() {
    const { translations } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        md: { span: 5 },
        sm: { span: 24 },
        xs: { span: 24 }
      },
      wrapperCol: {
        md: { span: 19 },
        sm: { span: 24 },
        xs: { span: 24 }
      }
    };
    return (
      <div>
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <Form.Item
            {...formItemLayout}
            label={
              translations && intl.get("loading.publicMsg.register.verify.code")
            }
          >
            <Row gutter={8}>
              <Col span={10}>
                {getFieldDecorator("captcha", {
                  rules: [
                    {
                      required: true,
                      message:
                        translations &&
                        intl.get("loading.publicMsg.register.verify.codeMsg")
                    },
                    {
                      pattern: /^\d{6}$/,
                      message:
                        translations &&
                        intl.get(
                          "loading.publicMsg.register.verify.codeWarnMsg"
                        )
                    }
                  ]
                })(<Input />)}
              </Col>
              <Col span={12}>
                <Button onClick={this.sendCode} disabled={!this.state.liked}>
                  <span>
                    {translations &&
                      intl.get("loading.publicMsg.register.verify.sendbtn")}
                  </span>
                </Button>
              </Col>
            </Row>
          </Form.Item>
          <Form.Item
            wrapperCol={{
              xs: { span: 24, offset: 0 },
              sm: { span: 16, offset: 5 }
            }}
          >
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.vaIidate()}
              style={{ marginRight: "0.5rem" }}
              loading={this.state.loading}
            >
              {translations &&
                intl.get("loading.publicMsg.register.verify.btn")}
            </Button>
            {/* <Button type="danger" onClick={() => {auth.logout().then(ret => { window.location = this.props.route.locationUrl}) }} >
              {translations && intl.get("home.publicMsg.drawer.LogoutWord")}
            </Button> */}
            <Button type="default" onClick={this.props.prev}>
              {translations && intl.get("general.button.back")}
            </Button>
          </Form.Item>
        </Form>
      </div>
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
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(Verify));
