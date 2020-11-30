import React, { useEffect } from "react";
import { Form, Button, Icon } from "antd";
import { connect } from "react-redux";
import intl from "components/utils/language";
import toast from "components/utils/toast";

// redux_action
import { setRegistertKey } from "components/actions/auth_action";

// API
import auth_API from "components/services/authService";
import user_API from "components/services/userService";

import OtherLogin, {
  goRegister
} from "components/common/login/verify/otherLogin";

import otherLoginScss from "assets/css/login/otherLogin.module.scss";

const headerPosition = "home.publicMsg.role.firstLogin";

// function goParentLogin({ UPDATE_AUTH }) {
//   return UPDATE_AUTH({ loginCode: 210 });
// }

function logout({ UPDATE_AUTH }) {
  return toast.createToast({
    msg: "已登出",
    onOpen: () => auth_API.logout(),
    onClose: () => {
      UPDATE_AUTH({ userState: "" });
      window.location = "/";
    }
  });
}

function tipsPage(props) {
  const {
    translations: { initDone },
    RD_setRegistertKey
  } = props;


  return (
    <Form className="login-form">
      <Form.Item>
        <p
          style={{
            textAlign: "center",
            color: "#bfbfbf",
            fontSize: "16px",
            marginBottom: 0
          }}
        >
          <span>
            {intl.getPlus({
              initDone,
              value: "loading.login.parentLogin.welcomeTips.oneLine",
              variable: { name: props.user.name }
            })}
          </span>
          <br />
          <span>
            {intl.getPlus({
              initDone,
              value: "loading.login.parentLogin.welcomeTips.towLine"
            })}
          </span>
        </p>
      </Form.Item>
      <Form.Item>
        <OtherLogin />
        <Button
          className={`${otherLoginScss.button} ${otherLoginScss.email}`}
          type="link"
          block
          onClick={() => {
            RD_setRegistertKey("1");
            goRegister(props);
          }}
        >
          <Icon type="mail" theme="filled" className={otherLoginScss.icon} />
          {intl.getPlus({
            initDone,
            value: `${headerPosition}.emailVerify`
          })}
        </Button>
        <Button
          className={`${otherLoginScss.button} ${otherLoginScss.phone}`}
          type="link"
          block
          onClick={() => {
            RD_setRegistertKey("2");
            goRegister(props);
          }}
        >
          <Icon type="phone" theme="filled" className={otherLoginScss.icon} />
          {intl.getPlus({
            initDone,
            value: `${headerPosition}.phoneVerify`
          })}
        </Button>
      </Form.Item>
      <Form.Item style={{ textAlign: "center" }}>
        <Button type="primary" onClick={() => logout(props)}>
          {intl.getPlus({
            initDone,
            value: `logout`
          })}
        </Button>
      </Form.Item>
    </Form>
  );
}

function mapStateToProps({ user, auth, translations }) {
  return { user, auth, translations };
}

const mapDispatchToProps = dispatch => ({
  UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload }),
  initUserData: payload => dispatch({ type: "INIT", payload }),
  RD_setRegistertKey: key => dispatch(setRegistertKey(key))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(tipsPage));
