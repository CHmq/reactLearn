import React ,  { Component } from "react";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import basicStyle from "assets/css/contact/basic.module.scss";
const _lang = `otherPage.contact`;

class Contact extends Component {
    
    render() {
    const { route } = this.props;
    return (
    <div className={basicStyle.center}>
      <h1>{intl.get(`${_lang}.title`)}</h1>
      <div style={{fontSize: '20px'}}>
      {intl.getHTML(`${_lang}.detail.${route.currentLocation}`) || intl.getHTML(`${_lang}.detail.hk`)}
      </div>
    </div>
  );
      }
    
}

function mapStateToProps( { route, user, translations }) {
    return {
        route,
        user,
        translations
    };
}

export default connect(mapStateToProps)(Contact);
