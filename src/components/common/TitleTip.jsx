/*
 * @使用方法:创建组件<TitleTip tip={''} width='默认100%'>
 */
import React, { Component } from "react";
import { Row , Typography , Skeleton, Icon, Form } from "antd";

// import intl from "react-intl-universal";
import { connect } from "react-redux";

import TextEdit from "components/common/TextEdit";

import style from "assets/css/TitleTip.module.scss";

import { Textfit } from "react-textfit";

class TitleTip extends Component {
  static defaultProps = {
    width: "100%",
    color: "",
    title: "",
    URLid: ''
  };

  render() {
    const { width, color, name, description } = this.props;
    const styleCss = {
      TitleTipWarp: {
        width: width,
        color: color,
        height: "100%",
        flexDirection : "column",
        justifyContent: "center"
      },
      content: {
        maxHeight: "100%",
        overflowY: "auto",
        width:"100%",
        padding:"0 5px"
      }
    };

    return (
      <Row type="flex" align="middle" justify="start" style={styleCss.TitleTipWarp}>
        {!!this.props.manage || !(!!name && !description) ? (
        <div className={`${style.TitleTipText} d-flex`} style={{width:"100%",  flexDirection: "column", justifyContent: "center" }}>
          <Skeleton active loading={description ? false : true}>
            <Typography.Title style={{color:"white" }}>{name}</Typography.Title>
            <Textfit mode="multi" min={12} max={20} style={{height : "100%" , lineHeight : "200%"}} >
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </Textfit>
          </Skeleton>
          {this.props.manage && (
            <TextEdit 
            name={name}
            description={description}
            langInfo={this.props.langInfo}
            URLid={this.props.URLid}
            schoolId={this.props.schoolId}
            updateCallback={() => this.props.updateData()}
            >
              <div className={style.set}><Icon type="form" /></div>
            </TextEdit>
          )} 
        </div>) : ("") }
      </Row>
    );
  }
}

/** redux 獲得全局數據
 * route  route data (url, language) --暫時沒有用到
 * user  user data (用戶數據)
 */
function mapStateToProps({ route, user, translations }) {
  return {
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
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(TitleTip));
