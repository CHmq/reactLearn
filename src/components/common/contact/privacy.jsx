import React from "react";

import intl from "react-intl-universal";

import basicStyle from "assets/css/contact/basic.module.scss";

const transitionPosition = `otherPage.privacy`;

const privacy = () => {
  return (
    <div className={basicStyle.center}>
      {intl.getHTML(`${transitionPosition}`)}
    </div>
  );
};

export default privacy;
