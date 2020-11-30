import React from "react";
import intl from "components/utils/language";
// import { Button, Icon } from "antd";
import { connect } from "react-redux";

import loginBasics from "assets/css/login/basics.module.scss";
// import otherLoginScss from "assets/css/login/otherLogin.module.scss";

export function goRegister({ UPDATE_AUTH }) {
  return UPDATE_AUTH({ userState: "register" });
}

export function goTipsPage({ auth: { loginCode }, UPDATE_AUTH }) {
  if ([210, 302].includes(loginCode))
    return UPDATE_AUTH({ userState: "tipsPage" });
  return UPDATE_AUTH({ userState: "" });
}

function otherLogin(props) {
  const {
    translations: { initDone },
    auth: { userState }
  } = props;

  const headerPosition = "home.publicMsg.role.firstLogin";

  return (
    <React.Fragment>
      {userState !== "tipsPage" && (
        <p className={loginBasics.tipsTextLine}>
          <span>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.LoginTipsRegister.or`
            })}
          </span>
          <br />
          <span>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.LoginTipsRegister.tips`
            })}
          </span>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a onClick={() => goRegister(props)}>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.LoginTipsRegister.goParent`
            })}
          </a>
        </p>
      )}
    </React.Fragment>
  );
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
)(otherLogin);
