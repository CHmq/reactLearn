import React, { Component } from "react";
import { Form, Input, Button, Icon, Modal } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import toast from "components/utils/toast";

import auth_API from "components/services/authService";
import user_API from "components/services/userService";

import FristLogin from "components/common/login/verify/firstLogin";
import ParentEdit from "components/common/login/role/parentEdit";
import TipsAddKid from "components/common/login/account/tipsAddKid";
import AddKid from "components/common/login/account/addKid";
import AddParent from "components/common/login/account/addParent";
import {
  goRegister,
  goTipsPage
} from "components/common/login/verify/otherLogin";

import loginBasics from "assets/css/login/basics.module.scss";
import parentLoginScss from "assets/css/login/parentLogin.module.scss";
import Register from "components/Register";

/**
 * parentLogin 家長登錄
 *
 * @export
 * @class parentLogin
 * @extends {Component}
 */
export class parentLogin extends Component {
  /**
   * state
   *  viewState viewState Object
   *      submitLoading 登錄 button state bool
   *      modalVisible modal state bool
   * @memberof parentLogin
   */
  state = {
    viewState: { submitLoading: false, modalVisible: false }
  };

  /** button_Loading_State */
  switchSubLoding = () => {
    const { submitLoading } = this.state.viewState;
    this.setState({ viewState: { submitLoading: !submitLoading } });
  };

  /** 家長登錄 erros
   * code 錯誤碼
   */
  parentLoginErrors = code => {
    const { switchSubLoding } = this;
    const errors = new Map()
      .set(0, () =>
        toast.createToast({
          type: "error",
          msg: "登錄失敗,工程師正在排查錯誤,請稍後再試!",
          onClose: () => switchSubLoding()
        })
      )
      .set(200, () =>
        toast.createToast({
          type: "error",
          msg: "帳號密碼錯誤,請重試!",
          onClose: () => switchSubLoding()
        })
      )
      .set(203, () =>
        toast.createToast({
          type: "error",
          msg: "該帳戶不存在,請重試",
          onClose: () => switchSubLoding()
        })
      )
      .set(210, () =>
        toast.createToast({
          msg: "請登入或註冊家長帳戶進行綁定!",
          onClose: () => switchSubLoding()
        })
      );
    return errors.get(code)
      ? errors.get(code)()
      : toast.createToast({
          type: "error",
          msg: "發生了未知的錯誤,您可以稍後再試",
          onClose: () => switchSubLoding()
        });
  };

  /** 点击登录事件__parent
   * params
   *  e 時間對象
   */
  handleSubmitLogin = async e => {
    e.preventDefault();
    const {
      props: {
        form: { getFieldsValue },
        initUserData
      },
      state: {
        viewState: { modalVisible }
      },
      parentLoginErrors,
      switchSubLoding
    } = this;
    switchSubLoding();
    const { username, password } = getFieldsValue(["username", "password"]);
    try {
      if (window.localStorage.getItem("access_token"))
        return toast.createToast({
          msg: "請選擇綁定/新增子女",
          autoClose: "1500",
          position: "top-left",
          onOpen: () => {
            this.setState({ viewState: { modalVisible: !modalVisible } });
          }
        });

      // 210 狀態下的登陸
      await auth_API.login(username, password);

      // 登陸如果成功 發送請求 獲取用戶信息
      initUserData(await user_API.getUserData());
      toast.createToast({
        msg: "請選擇綁定/新增子女",
        autoClose: "1500",
        position: "top-left",
        onOpen: () =>
          this.setState({ viewState: { modalVisible: !modalVisible } })
      });
    } catch (error) {
      console.log(error);
      parentLoginErrors(error.result);
    }
  };

  /** 渲染 modal el */
  modalElRender = () => {
    const {
      props: {
        auth: { userState }
      }
    } = this;
    const view = new Map()
      .set("tips", <TipsAddKid />)
      .set("addKid", <AddKid />)
      .set("addParent", <AddParent />)
      .set("kidAccount", <FristLogin />)
      .set("register", <Register />);
    return view.get(userState) || <ParentEdit />;
  };

  /** 创建登录表单
   * params
   *  defaultUser defaultPwd 測試帳號密碼
   */
  createLoginFrom = ({ defaultUser, defaultPwd }) => {
    const {
      props: {
        form: { getFieldDecorator },
        auth: { userState },
        UPDATE_AUTH
      },
      state: {
        viewState: { submitLoading, modalVisible }
      },
      handleCancel,
      modalElRender
    } = this;
    return (
      <React.Fragment>
        <div className={loginBasics.titleImg}>
          <img src={require("assets/image/logo.png")} alt="" />
        </div>
        <Form onSubmit={this.handleSubmitLogin} className="login-form">
          <Form.Item>
            {getFieldDecorator("username", {
              rules: [{ required: true, message: "請輸入您的用戶名!" }],
              initialValue: defaultUser
            })(
              <Input
                prefix={<Icon type="user" className={loginBasics.inputIcon} />}
                placeholder="用 戶 名"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("password", {
              rules: [{ required: true, message: "請輸入您的密碼!" }],
              initialValue: defaultPwd
            })(
              <Input
                prefix={<Icon type="lock" className={loginBasics.inputIcon} />}
                type="password"
                placeholder="密 碼"
              />
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitLoading}
            >
              {intl.get("loading.login.parentLogin.loginIn")}
            </Button>
            <p className={loginBasics.tipsTextLine}>
              <span>
                {intl.get("loading.login.parentLogin.ParentTipsRegister.or")}
              </span>
              <br />
              <span>
                {intl.get("loading.login.parentLogin.ParentTipsRegister.tips")}
              </span>
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a onClick={() => goRegister(this.props)}>
                {intl.get(
                  "loading.login.parentLogin.ParentTipsRegister.goParent"
                )}
              </a>
            </p>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              onClick={() => {
                goTipsPage(this.props);
                UPDATE_AUTH({ loginCode: 302 });
              }}
            >
              {intl.get("loading.login.parentLogin.ParentTipsRegister.return")}
            </a>
          </Form.Item>
        </Form>
        <Modal
          centered
          width={600}
          visible={modalVisible}
          onCancel={handleCancel}
          bodyStyle={{
            padding: "0 0 20px 0",
            borderRadius: "15px",
            minHeight: `${userState === "addParent" ? "auto" : 600}`
          }}
          className={parentLoginScss.parentEditModal}
          footer={null}
          maskClosable={false}
        >
          {modalElRender()}
        </Modal>
      </React.Fragment>
    );
  };

  /** parentEdit 模態框 visible */
  handleCancel = () => {
    const {
      state: {
        viewState: { modalVisible }
      },
      props: { UPDATE_AUTH }
    } = this;
    UPDATE_AUTH({ userState: "" });
    this.setState({ viewState: { modalVisible: !modalVisible } });
  };

  render() {
    return this.createLoginFrom({
      defaultUser: "teacher@evo",
      defaultPwd: "666666"
    });
  }
}

/**
 * redux 獲取數據
 * user 用戶信息
 * auth 登錄信息
 */
function mapStateToProps({ user, auth }) {
  return { user, auth };
}

/**
 * redux 更新數據
 * initUserData 初始化用戶數據
 * UPDATE_AUTH 更新 auth 數據
 */
function mapDispatchToProps(dispatch) {
  return {
    initUserData: payload => dispatch({ type: "INIT", payload }),
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(parentLogin));
