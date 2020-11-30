/*
 * @使用方法:创建组件<Banner img={'图片路径'} height={'默认为400px'} heightauto={默认为false }>
 */

import React, { Component } from "react";
import { Button, Modal, Icon, Tooltip } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import Login from "components/common/login";
import Register from "components/Register";
import StudentEdit from "components/StudentEdit";

import "assets/css/ManagePopup.module.scss";

class LandingPopup extends Component {
  state = { visible: false, familyToken: null };

  componentDidMount() {
    this.setState({
      visible: !!this.props.familyToken,
      familyToken: this.props.familyToken
    });
  }

  //彈出框
  showModal = e => {
    // e.preventDefault();
    // e.stopPropagation();
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    e.preventDefault();
    this.setState({ visible: false, childOpen: false });
  };

  // /** 还原 login 默认 view */
  // onClose = e => {
  //   // return this.props.UPDATE_AUTH({ userState: "" });
  // };

  _alert(type) {
    // const {userState} = this.props.auth;
    switch (type) {
      case "login":
        return (
          <div style={{ marginTop: "20px" }}>
            <Login />
          </div>
        );
      case "register":
        return (
          <Register familyToken={this.state.familyToken} pageKey={"register"} />
        );
      case "studentedit":
        return (
          <StudentEdit
            item={this.props.item}
            title={this.props.title}
            courseId={this.props.courseId}
          />
        );
      default:
        return <div className="card-container" />;
    }
  }
  _alert1(loginpic) {
    const { style } = this.props;
    switch (loginpic) {
      case "english":
        return (
          <div onClick={this.showModal}>
            <img
              src={require(`assets/image/button/login_english.png`)}
              alt=""
              style={{ width: "120px", cursor: "pointer" }}
            />
          </div>
        );
      case "zh":
      case "cn":
        return (
          <div onClick={this.showModal}>
            <img
              src={require(`assets/image/button/login_${loginpic}.png`)}
              alt=""
              style={{ width: "130px", cursor: "pointer" }}
            />
          </div>
        );
      case "barChart":
        return (
          <Tooltip
            placement="right"
            title={
              this.props.translations.initDone &&
              intl.get("course_1.content.reportbtn")
            }
          >
            <div onClick={this.showModal} className="barChart">
              <Icon type="bar-chart" />
            </div>
          </Tooltip>
        );
      case "schoolCourse":
        return (
          <div onClick={this.showModal} style={{width: '100%'}}>
            <Icon type="bar-chart" style={{marginRight: 10}} />
            {this.props.translations.initDone && intl.get("schoolCourse.menu_repot")}
          </div>
        )
      default:
        if (
          this.props.type === "login" &&
          this.props.userState === "register"
        ) {
          return (
            <Button
              onClick={this.showModal}
              style={{ ...style, ...this.props.style }}
            >
              繼續
            </Button>
          );
        }
        return (
          <Button
            onClick={this.showModal}
            style={{ ...style, ...this.props.style }}
            block
          >
            {this.props.title}
          </Button>
        );
    }
  }

  render() {
    const {
      type,
      width,
      closable,
      Modalstyle,
      className,
      auth: { userState },
      loginpic
    } = this.props;
    return (
      <div style={{ display: "inline-block", width: '100%' }}>
        {this._alert1(loginpic)}
        {this.state.visible && (
          <Modal
            className={className}
            width={width || (userState === "register" ? 500 : "auto")}
            visible={this.state.visible}
            footer={null}
            onOk={this.handleOk}
            closable={closable}
            onCancel={this.handleCancel}
            style={{ ...Modalstyle }}
            bodyStyle={{ height: "auto" }}
            centered={type === "login" && true}
            zIndex={this.props.zIndex || 1010}
          >
            {this._alert(type)}
          </Modal>
        )}
      </div>
    );
  }
}

/** redux 數據獲取
 * auth 登錄信息
 */

function mapStateToProps({ auth, translations }) {
  return { auth, translations };
}

/**
 * redux 更新數據
 * UPDATE_AUTH 更新 modal_view
 */
function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload })
  };
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true
})(LandingPopup);
