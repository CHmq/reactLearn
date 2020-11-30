/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { connect } from "react-redux";

// page view
import FristLogin from "components/common/login/verify/firstLogin";
import ParentLogin from "components/common/login/verify/parentLogin";
import Forget from "components/common/login/verify/forget";
import Register from "components/Register";
import TipsPage from "components/common/login/verify/tipsPage";
// import OtherLogin from "components/common/login/verify/otherLogin";

/**
 * 登录页面
 *    已经被拆分
 *
 * @export 登录页面
 * @class login
 * @extends {Component}
 */

function index({ auth }) {
  const { loginCode, userState } = auth;
  if (userState === "forgetPwd") return <Forget />;
  if (userState === "register") return <Register />;
  if (loginCode === 210) return <ParentLogin />;
  if (userState === "tipsPage") return <TipsPage />;
  return <FristLogin />;
}

/** redux
 * auth 登錄狀態
 */
function mapStateToProps({ auth }) {
  return {
    auth
  };
}

export default connect(mapStateToProps)(index);
