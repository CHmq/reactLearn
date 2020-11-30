import React, { Component } from "react";
import { Steps, Row, Col } from "antd";
import { Form, Icon, Input, Button, message } from "antd";
import styleCss from "assets/css/forget.module.scss";
import user from "components/services/userService";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import toast from "components/utils/toast";

import { PASSWORD } from "config/app.json";

const { Step } = Steps;
/**
 * 忘记密码
 *
 * @export
 * @class forget
 * @extends {Component}
 */
class forget extends Component {
  state = {
    index: 0, // 步骤条顯示 0：切換為 請輸入電郵/電話 1：切換 驗證
    seconds: 60, //时间初始化 單位 秒
    liked: true, //获取验证码文案
    pwloading: false, // 按钮加载 默认关闭
    input: "", // 获取帐号
    pullpsword: false // 按钮加载 提交修改密碼 默认关闭
  };
  // 提交获取验证码
  getVerify = async e => {
    e.preventDefault();
    this.setState({ pwloading: true }); // 按钮加载开启
    let value = "";
    this.props.form.validateFields((err, values) => {
      if (!err) {
        value = values.input;
        this.setState({
          input: value
        });
      }
    });
    this.getVerifyMethod(value).then(result => {
      console.log(result);
      if (result === 1) {
        console.log("成功获取验证码");
        this.setState({
          index: 1,
          liked: false, // 获取验证码按钮开启禁止点击
          pwloading: false // 按钮加载关闭
        });
        this.countDown(); // 获取验证码按钮开始倒计时
      } else {
        this.setState({ pwloading: false }); // 按钮加载关闭
      }
    });
  };
  // 获取验证码方法
  getVerifyMethod = async value => {
    try {
      const data = await user.getVerify(value);
      if (data === 1) {
        message.success(this.props.translations.initDone && intl.get("loading.forget.sendCodeSuccess"))
      }
      return data;
    } catch (err) {
      message.error(this.props.translations.initDone && intl.get("loading.forget.sendCodeFailed"))
      // 获取验证码失败
      console.log(err);
    }
  };
  // 提交修改密码
  changePassword = async e => {
    e.preventDefault();
    let value = "";
    this.setState({
      pullpsword: true
    });
    this.props.form.validateFields((err, values) => {
      if (!err) {
        value = values;
        console.log("Received values of form: ", values);
      }
    });
    try {
      const data = await user.resetPW(
        this.state.input,
        value.password,
        value.vcode
      );
      console.log(data);
      // message.success('密码修改成功')
      return toast.createToast({
        msg:this.props.translations.initDone && intl.get("loading.forget.modify"),
        type: "success",
        onClose: () => {
          const {
            auth: { userState }
            // UPDATE_AUTH
          } = this.props;
          if (userState === "forgetPwd") return window.location.reload();
          this.props.onCloseforget();
        }
      });
    } catch (err) {
      if (err.result === 271) {
        return toast.createToast({
          msg: this.props.translations.initDone && intl.get("loading.forget.goBack"),
          type: "error",
          onClose: () => {
            this.setState({
              index: 0
            });
          }
        });
      } else {
        this.setState({
          pullpsword: false
        });
        // message.error("密碼修改失敗");
        message.error(this.props.translations.initDone && intl.get("loading.forget.pwdRevise"));

      }
      console.log(err);
    }
  };

  // 獲取電郵按鈕默認禁用
  getvaIidate = () => {
    const { getFieldsValue, getFieldsError } = this.props.form;
    const value = getFieldsValue(["input"]);
    const error = getFieldsError(["vcode"]);
    return !value.input || error.input ? true : false;
  };

  //提交密碼修改按鈕默認禁用
  changevaIidate = () => {
    const { getFieldsValue, getFieldsError } = this.props.form;
    const value = getFieldsValue(["vcode", "password"]);
    const error = getFieldsError(["vcode", "password"]);
    return !value.password || error.password || !value.vcode || error.vcode
      ? true
      : false;
  };
  // 获取并等待60秒验证码
  sendCode = () => {
    this.setState({
      liked: false
    });
    this.resend();
    this.countDown();
  };
  // 重发验证码
  async resend() {
    this.getVerifyMethod(this.state.input);
    console.log("重发验证码");
  }
  //倒計時
  countDown = () => {
    let timer = setInterval(() => {
      this.setState({ liked: false, seconds: this.state.seconds - 1 }, () => {
        if (this.state.seconds === 0) {
          clearInterval(timer);
          this.setState({
            liked: true,
            seconds: 60
          });
        }
      });
    }, 1000);
  };
  // 取消找回密码
  goback = () => {
    return (
      <Button
        block
        onClick={() => {
          const {
            auth: { userState },
            UPDATE_AUTH
          } = this.props;
          if (userState === "forgetPwd") return UPDATE_AUTH({ userState: "" });
          this.props.onCloseforget();
        }}
      >
        {this.props.translations.initDone && intl.get("loading.forget.cancel")}
      </Button>
    );
  };

  render() {
    const { translations } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    };
    const formItemY = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    };
    // 多语言
    const _fn = function(value) {
      return translations.initDone && intl.get(`loading.forget.` + value);
    };
    const Language = {
      infortitle: _fn("infortitle"),
      Verifytitle: _fn("verifytitle"),
      gettitle: _fn("gettitle"),
      inputrule: _fn("inputrule"),
      verifybtn: _fn("verifybtn"),
      verifytitle: _fn("verifytitle"),
      verifynumber: _fn("verifynumber"),
      verifyrule: _fn("verifyrule"),
      getverifybtn: _fn("getverifybtn"),
      password: _fn("password"),
      passwordnull: _fn("passwordnull"),
      passwordrule: _fn("passwordrule"),
      passwordbtn: _fn("passwordbtn")
    };
    // console.log(Language)
    return (
      <div>
        <Steps
          current={this.state.index}
          className={styleCss.flex}
          size="small"
        >
          <Step title={Language.infortitle} description="" />
          <Step title={Language.Verifytitle} description="" />
        </Steps>
        {this.state.index === 0 ? (
          // 第一步 獲取
          <Form onSubmit={this.getVerify} className="login-form">
            <Form.Item>
              <h2>{Language.gettitle}</h2>
              {getFieldDecorator("input", {
                rules: [{ required: true, message: Language.inputrule }]
              })(
                <Input
                  prefix={
                    <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                />
              )}
            </Form.Item>
            <Form.Item>
              <Button
                block
                loading={this.state.pwloading}
                type="primary"
                disabled={this.getvaIidate()}
                htmlType="submit"
                className="login-form-button"
              >
                {Language.verifybtn}
              </Button>
              {this.goback()}
            </Form.Item>
          </Form>
        ) : (
          // 第二步 驗證
          <div>
            {/*input 美化作用禁止浏览器自动填充影响页面 */}
            <input
              type="text"
              id="username"
              style={{ display: "none" }}
              disabled
            />
            <input
              type="password"
              id="password"
              style={{ display: "none" }}
              disabled
            />
            <h2>{Language.verifytitle}</h2>
            <h2>{this.state.input}</h2>
            <Form.Item label={Language.verifynumber} {...formItemY}>
              <Row>
                <Col span={12}>
                  {getFieldDecorator("vcode", {
                    rules: [
                      {
                        required: true,
                        message: Language.verifyrule
                      }
                      // {
                      //   pattern: /^[1][3-8]\d{9}$|^([6|9])\d{7}$|^[6]([8|6])\d{5}$|\d{9}/,
                      //  message:""
                      // }
                    ]
                  })(<Input />)}
                </Col>
                <Col span={12}>
                  <Button
                    block
                    onClick={this.sendCode}
                    disabled={!this.state.liked}
                  >
                    {this.state.liked ? (
                      <span>{Language.getverifybtn}</span>
                    ) : (
                      <span>{this.state.seconds + " s "}</span>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
            <Form.Item {...formItemLayout} label={Language.password}>
              {getFieldDecorator("password", {
                rules: [
                  {
                    required: true,
                    message: Language.passwordnull
                  },
                  {
                    pattern: PASSWORD,
                    message: Language.passwordrule
                  }
                ]
              })(<Input.Password />)}
            </Form.Item>
            <Form.Item>
              <Button
                block
                loading={this.state.pullpsword}
                type="primary"
                htmlType="submit"
                disabled={this.changevaIidate()}
                onClick={this.changePassword}
              >
                {Language.passwordbtn}
              </Button>
              {this.goback()}
            </Form.Item>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps({ auth, translations }) {
  return { auth, translations };
}

function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(forget));
