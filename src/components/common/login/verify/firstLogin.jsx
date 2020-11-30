/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { Form, Input, Button, Icon } from "antd";
import { connect } from "react-redux";
import intl from "components/utils/language";
import intl1 from "react-intl-universal";

import toast from "components/utils/toast";

// page view
import OtherLogin from "components/common/login/verify/otherLogin";

// API
import auth_API from "components/services/authService";
import family_API from "components/services/familyService";
import user_API from "components/services/userService";

import loginBasics from "assets/css/login/basics.module.scss";

/**
 * 初次登錄 可登錄並回到首頁 or result210 go bindkid
 *
 * @export
 * @class firstLogin
 * @extends {Component}
 */
export class firstLogin extends Component {
  /**
   * state
   *  viewState 視圖state Object
   *      submitLoading 登錄狀態 bool
   */
  state = {
    viewState: {
      submitLoading: false
    }
  };

  /** 按鈕加载状态切换 */
  switchSubLoding = () => {
    const { submitLoading } = this.state.viewState;
    this.setState({ viewState: { submitLoading: !submitLoading } });
  };

  /** 綁定子女 410 error
   * params
   *    code 狀態碼
   */
  bindKid_401_Erros = code => {
    const { switchSubLoding } = this;
    const errors = new Map().set(203, () =>
      toast.createToast({
        type: "error",
        msg: "該帳號已經綁定了kid帳戶!",
        onClose: () => {
          switchSubLoding();
          window.location = "/";
        }
      })
    );
    return errors.get(code)
      ? errors.get(code)()
      : toast.createToast({
          type: "error",
          msg: "發現了未知的錯誤",
          onClose: () => switchSubLoding()
        });
  };

  /** 當不存在 kid_token 選擇綁定時 登錄 result 210 來進行綁定 */
  bindKid_401 = async () => {
    const {
      props: {
        auth: {
          kid_token,
          AddKidMsg: { family_id }
        },
        user: { language },
        translations
      },
      switchSubLoding,
      bindKid_401_Erros
    } = this;

    try {
      const user_id = await family_API.addChildren({
        kid_token,
        family_id,
        language
      });
      await user_API.swap({ user_id });
      toast.createToast({
        type: "success",
        msg: translations.initDone && intl1.get("home.publicMsg.role.firstLogin.msg.success"),
        onClose: () => {
          switchSubLoding();
          window.location = "/";
        }
      });
    } catch (error) {
      console.log(error);
      bindKid_401_Erros(error.result);
    }
  };

  /** 登录 Errors 处理 */
  loginErrors = error => {
    const {
      switchSubLoding,
      bindKid_401,
      props: {
        initUserData,
        UPDATE_AUTH,
        auth: { loginCode },
        translations
      }
    } = this;

    const _fn = function(value) {
      return translations.initDone && intl1.get("home.publicMsg.role.firstLogin.msg."+value)
    }
    const Language = {
      failed: _fn("failed"),
      noLogIn: _fn("noLogIn"),
      accountError: _fn("accountError"),
      userNull: _fn("userNull"),
      pwdNull: _fn("pwdNull"),
      accountBind: _fn("accountBind"),
      errorDelay: _fn("errorDelay")
    }

    const errors = new Map()
      .set(0, () =>
        toast.createToast({
          msg: Language.failed,
          type: "error",
          onClose: () => switchSubLoding()
        })
      )
      .set(21, () =>
        toast.createToast({
          msg: Language.noLogIn,
          type: "error",
          onClose: () => switchSubLoding()
        })
      )
      .set(200, () =>
        toast.createToast({
          msg: Language.accountError,
          type: "error",
          onClose: () => switchSubLoding()
        })
      )
      .set(203, () =>
        toast.createToast({
          msg: Language.userNull,
          type: "error",
          onClose: () => switchSubLoding()
        })
      )
      .set(204, () =>
        toast.createToast({
          msg: Language.pwdNull,
          type: "error",
          onClose: () => switchSubLoding()
        })
      )
      .set(210, () => {
        UPDATE_AUTH({ kid_token: error.data });
        if (loginCode === 401) return bindKid_401();
        toast.createToast({
          msg: Language.accountBind,
          onOpen: async () => initUserData(await user_API.get(error.data)),
          onClose: () => {
            switchSubLoding();
            UPDATE_AUTH({ userState: "tipsPage", loginCode: 302 });
          }
        });
      });
    return errors.get(error.result)
      ? errors.get(error.result)()
      : toast.createToast({
          msg:Language.errorDelay,
          type: "error",
          onClose: () => switchSubLoding()
        });
  };

  /**
   * 登陆事件
   * 分别处理 用户登录/家长登录
   * params
   *    e   事件對象
   *
   * @memberof firstLogin
   */
  handleSubmitLogin = async e => {
    e.preventDefault();
    if(!!this.state.viewState && this.state.viewState.submitLoading){
        return;
    }
    const {
      switchSubLoding,
      props: {
        initUserData,
        form: { getFieldsValue },
        translations
        // route: { currentLocation }
      }
    } = this;

    switchSubLoding();

    const { username, password, remember } = getFieldsValue([
      "username",
      "password",
      "remember"
    ]);

    try {
      const value = await auth_API.login(username, password, remember);
      localStorage.setItem("show", true);
      return toast.createToast({
        msg: translations.initDone && intl1.get("home.publicMsg.role.firstLogin.msg.welcome"),
        type: "success",
        onClose: async () => {
          switchSubLoding();
          initUserData(await user_API.me(true));
        }
      });
    } catch (error) {
      console.log(error);
      this.loginErrors(error);
    }
  };

  /** 表單驗證
   * return bool
   */
  vaIidate = () => {
    const { getFieldsError, getFieldsValue } = this.props.form;
    const value = Object.values(getFieldsValue(["username", "password"])).every(
      item => item !== undefined && item !== ""
    );
    const error = Object.values(getFieldsError(["username", "password"])).every(
      item => item === "" || item === undefined
    );
    return value === true && error === true ? false : true;
  };

  forgetPwd = () => {
    const { UPDATE_AUTH } = this.props;
    UPDATE_AUTH({ userState: "forgetPwd" });
  };

  /** 创建登录表单
   *  params
   *      defaultUser,defaultPwd 測試使用的帳戶密碼
   */
  createLoginFrom = ({ defaultUser, defaultPwd }) => {
    const {
      props: {
        form: { getFieldDecorator },
        translations: { initDone },
        auth: { userState },
        UPDATE_AUTH
      },
      state: {
        viewState: { submitLoading }
      },
      vaIidate,
      forgetPwd
    } = this;

    const headerPosition = "home.publicMsg.role.firstLogin";

    return (
      <React.Fragment>
        {userState === "kidAccount" && (
          <h2 className={loginBasics.title}>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.title`
            })}
          </h2>
        )}
        <div className={loginBasics.titleImg}>
          <img
            src={require("assets/image/logo.png")}
            alt="EVIGarten"
            style={userState === "kidAccount" ? { width: "80%" } : null}
          />
        </div>
        <Form
          onSubmit={this.handleSubmitLogin}
          className="login-form"
          style={userState === "kidAccount" ? { padding: "0 50px" } : null}
        >
          <Form.Item>
            {getFieldDecorator("username", {
              rules: [
                {
                  required: true,
                  message: intl.getPlus({
                    initDone,
                    value: `${headerPosition}.form.username`
                  })
                }
              ],
              initialValue: defaultUser
            })(
              <Input
                autoFocus
                prefix={<Icon type="user" className={loginBasics.inputIcon} />}
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.username`
                })}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: intl.getPlus({
                    initDone,
                    value: `${headerPosition}.form.pwd`
                  })
                }
              ],
              initialValue: defaultPwd
            })(
              <Input
                prefix={<Icon type="lock" className={loginBasics.inputIcon} />}
                type="password"
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.pwd`
                })}
              />
            )}
          </Form.Item>
          <Form.Item>
            {userState !== "kidAccount" && (
              <React.Fragment>
                <a onClick={forgetPwd}>
                  {intl.getPlus({
                    initDone,
                    value: `${headerPosition}.forgetPwd`
                  })}
                  ?
                </a>
              </React.Fragment>
            )}
            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={vaIidate()}
              loading={submitLoading}
            >
              {intl.getPlus({
                initDone,
                value: `${headerPosition}.loginIn`
              })}
            </Button>
            {userState === "kidAccount" && (
              <p style={{ textAlign: "center" }}>
                <a onClick={() => UPDATE_AUTH({ userState: "" })}>
                  {intl.getPlus({
                    initDone,
                    value: `general.button.back`
                  })}
                </a>
              </p>
            )}
            {userState !== "kidAccount" && <OtherLogin />}
          </Form.Item>
        </Form>
      </React.Fragment>
    );
  };

  render() {
    return this.createLoginFrom({
      defaultUser: "",
      defaultPwd: ""
    });
  }
}

/** redux 數據獲取
 * auth 登錄信息
 */
function mapStateToProps({ route, user, auth, translations }) {
  return { route, user, auth, translations };
}

/**
 * redux 更新數據
 * UPDATE_AUTH 更新 modal_view
 */
function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload }),
    initUserData: payload => dispatch({ type: "INIT", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(firstLogin));
