import React, { Component, Fragment } from "react";
import { Drawer, Card, Avatar, Icon, Button, Row, Col, Modal } from "antd";
import { withRouter, Link } from "react-router-dom";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import toast from "components/utils/toast";

import DraggerImgUploading from "components/common/UploadingAvatar";

import user_API from "components/services/userService";

import Achieve from "../Achieve";
import Weekchart from "../Weekchart";
import ChangePassword from "../ChangePassword";
import authService from "components/services/authService";

import FristLogin from "components/common/login/verify/firstLogin";
import ParentEdit from "components/common/login/role/parentEdit";
import TipsAddKid from "components/common/login/account/tipsAddKid";
import AddKid from "components/common/login/account/addKid";
import AddParent from "components/common/login/account/addParent"
import UserEdit from "components/common/login/role/userEdit";
import Register from "components/Register";

import "assets/css/drawer.module.scss";
import parentLoginScss from "assets/css/login/parentLogin.module.scss";

// import icon1 from "assets/image/pageIcon1.png";
// import icon2 from "assets/image/pageIcon2.png";
import icon3 from "assets/image/pageIcon3.png";
// import icon4 from "assets/image/pageIcon4.png";
// import icon5 from "assets/image/pageIcon5.png";
import icon6 from "assets/image/pageIcon6.png";

const { Meta } = Card;
const confirm = Modal.confirm;

class MyDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routerLink: "",
      locationUrl: props.locationUrl,
      avatarUpload: false,
      visible: false,
      userEdit: false,
      viewState: {
        switchRole: false,
        switchClose: true
      },
      icon: [
        {
          // 历史
          src: icon3,
          link: "history"
        },
        {
          // 我的最爱
          src: icon6,
          link: "favorite"
        }
      ]
    };
  }

  parentLock = () => {
    const {
      route: { tag: routeTag }
    } = this.props;
    return user_API.getType() === "PARENT" && routeTag === "student";
  };

  async componentDidMount() {
    this.setState({ switchRole: this.props.swapUser || false });
  }

  componentDidUpdate(prevProps, prevState) {
    const { user: prevUser, swapUser: prevSwap } = prevProps;
    const {
      viewState: { switchRole: prevSwitchRole }
    } = prevState;
    const {
      props: {
        user,
        user: { type, status },
        UPDATE_AUTH,
        swapUser
      },
      state: {
        viewState: { switchRole }
      }
    } = this;
    
    if (prevSwap !== swapUser && !!swapUser) {
      this.showSlickModal();
    }

    if (prevUser !== user) {
      if (type === "PARENT") {
        UPDATE_AUTH({
          isParent: true,
          userState: status === "VERIFY" ? "verify" : ""
        });
      }
    }
    if (prevSwitchRole !== switchRole && switchRole === true)
      UPDATE_AUTH({ isParent: true });
  }

  //彈出框
  showModal = () => {
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
    this.setState({
      visible: false
    });
  };

  //关闭用户抽屉
  onClose = () => {
    this.props.onClose();
  };

  _Logout(title = "", okText = "", cancelText = "") {
    const { route } = this.props;
    confirm({
      title: title, //"你確定要登出嗎？",
      okText: okText, //"確認",
      cancelText: cancelText, //"取消",
      // content: 'Some descriptions',
      async onOk() {
        authService.logout().then(ret => {
          window.location.href = `/${route.currentLocation}/${route.currentLanguage.url}`;
        });
      },
      onCancel() {
        // console.log('Cancel');
      }
    });
  }

  /** 点击切换 展示 切换模态框 */
  showSlickModal = () => {
    const {
      // props: { UPDATE_AUTH },
      state: {
        viewState,
        viewState: { switchRole }
      }
    } = this;
    this.setState(
      { viewState: { ...viewState, switchRole: true } }
      // () => UPDATE_AUTH({ isLogin: true })
    );
  };

  /** 点击关闭 关闭模态框 */
  setSwitchRole = switchRole => {
    const {
      props: { UPDATE_AUTH, translations },
      state: {
        viewState,
        viewState: { switchClose }
      }
    } = this;
    if (this.parentLock() && switchClose)
      return toast.createToast({
        msg:
          translations.initDone &&
          intl.get("home.publicMsg.drawer.PleaseSelectChild"),
        position: "top-left",
        onOpen: () =>
          this.setState({
            viewState: { ...viewState, switchClose: !switchClose }
          }),
        onClose: () =>
          this.setState({ viewState: { ...viewState, switchClose } })
      });

    if (
      !switchRole &&
      !!this.props.swapUser &&
      typeof this.props.swapUserOnClose === "function"
    ) {
      this.props.swapUserOnClose();
    }
    this.setState({ viewState: { ...viewState, switchRole } }, () =>
      UPDATE_AUTH({ userState: "" })
    );
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
      .set("addParent", <AddParent $location={this.props.$location} />)
      .set("kidAccount", <FristLogin />)
      .set("verify", <Register result="1" />);
    return view.get(userState) || <ParentEdit />;
  };

  render() {
    const {
      modalElRender,
      props: {
        visible,
        locationUrl,
        user,
        auth: { userState },
        translations,
        initUser,
        route: { currentLanguage: $language },
        user: { img: userAvatar }
        // UPDATE_AUTH
      },
      state: {
        viewState: { switchRole }
      }
    } = this;
    const intranet = !!user.intranet ? user.intranet : null;
    const _fn = function(value) {
      return (
        translations.initDone && intl.get("home.publicMsg.drawer." + value)
      );
    };
    const Language = {
      ChangePword: _fn("ChangePword"),
      LogoutWord: _fn("LogoutWord"),
      charttitle: _fn("charttitle"),
      chartmin: _fn("chartmin"),
      chartweek: _fn("chartweek"),
      awardtitle: _fn("awardtitle"),
      more: _fn("more"),
      LogoutTitle: _fn("LogoutTitle"),
      Btncancel: _fn("Btncancel"),
      Btnconfirm: _fn("Btnconfirm"),
      titleTransfer: _fn("titleTransfer")
    };
    return (
      //抽屉
      <Drawer
        width={320}
        className="drawer_container"
        placement="right"
        closable={true}
        onClose={this.onClose}
        visible={this.parentLock() || visible}
        bodyStyle={{ padding: 0 }}
      >
        <Modal
          centered
          title={
            <h3>
              {translations.initDone && intl.get("home.publicMsg.avatar.tip")}
            </h3>
          }
          bodyStyle={{ backgroundColor: "#fff" }}
          visible={this.state.avatarUpload}
          onCancel={() => {
            this.setState({ avatarUpload: false });
          }}
          footer={null}
          maskClosable={false}
        >
          <DraggerImgUploading
            onCancel={() => {
              this.setState({ avatarUpload: false });
            }}
          />
        </Modal>
        <Card
          className="drawer_header"
          bordered={false}
          bodyStyle={{ backgroundColor: "#41c6e3" }}
        >
          <Meta
            className="meta"
            avatar={
              <div className="avatar_container">
                <Avatar
                  size={100}
                  src={userAvatar + "?t=" + Math.random() || null}
                  icon={!!userAvatar ? "" : "user"}
                  style={{
                    backgroundColor: !userAvatar ? "#efefef" : "white",
                    color: "black"
                  }}
                />
                <div
                  className="avatar_button"
                  onClick={() => {
                    this.setState({ avatarUpload: true });
                  }}
                >
                  <Icon type="camera" />{" "}
                  {translations.initDone &&
                    intl.get("course_1.content.edit.logo")}
                </div>
              </div>
            }
            title={user.full_name}
            description={
              <React.Fragment>
                <p>
                  {!!intranet && intranet.school["name_" + $language.value]}
                </p>
                <p>
                  {user.type === "STUDENT" && !!intranet && (
                    <Button type="primary" size="small" shape="round">{`${
                      intranet.grade["name_" + $language.value]
                    }${intranet.class["name_" + $language.value]}`}</Button>
                  )}
                </p>
              </React.Fragment>
            }
          />
          <Button className="SlickModal" onClick={this.showSlickModal}>
            <Icon type="sync" />
          </Button>
          <Modal
            centered
            width={600}
            visible={this.parentLock() || switchRole}
            bodyStyle={{
              padding: "0 0 20px 0",
              borderRadius: "15px",
              minHeight: `${userState === "addParent" ? "auto" : 600}`
            }}
            onCancel={() => this.setSwitchRole(false)}
            footer={null}
            maskClosable={false}
            className={parentLoginScss.parentEditModal}
          >
            {modalElRender()}
          </Modal>
          <br />
          <Button
            className="log_out"
            ghost="true"
            size="small"
            onClick={this._Logout.bind(
              this,
              Language.LogoutTitle,
              Language.Btnconfirm,
              Language.Btncancel
            )}
          >
            <Link
              to={{
                pathname: `${this.state.routerLink}`
              }}
            >
              {Language.LogoutWord}
              <Icon type="rollback" />
            </Link>
          </Button>
          <Button
            className="log_out"
            ghost="true"
            size="small"
            onClick={this.showModal}
          >
            {Language.ChangePword}
          </Button>
          <Button
            className="log_out"
            ghost="true"
            size="small"
            onClick={() => {
              this.setState({ userEdit: true});
            }}
          >
            {translations.initDone && intl.get("home.publicMsg.role.edit.userEdit.title")}
          </Button>
          {this.state.userEdit && (
            <UserEdit
              editClose={() => {
                user_API.me(true).then(_user => initUser(_user));
                this.setState({userEdit: false});
              }}
              user={this.props.user}
              translations={this.props.translations}
              hiddenRelation
            />
          )}
          <Modal
            title={Language.ChangePword}
            visible={this.state.visible}
            footer={null}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            style={{ background: "#fff", padding: "15px 20px" }}
            destroyOnClose={true}
          >
            <ChangePassword onCancel={() => this.handleCancel()} />
          </Modal>
        </Card>
        {user_API.getType() !== "PARENT" && (
          <Fragment>
            <Row className="linkwarp" type="flex" justify="center">
              <Col span={23} className="main">
                {this.state.icon.map((item, index) => {
                  return (
                    <Link
                      key={index}
                      to={{ pathname: `${locationUrl}${item.link}` }}
                    >
                      <Col
                        className="item"
                        style={{ backgroundImage: `url(${item.src})` }}
                      />
                    </Link>
                  );
                })}
                {!!user_API.getIntranet() && (
                  <Link
                    to={{ pathname: `${locationUrl}fishgame` }}
                    target="_blank">
                    <img src={require(`assets/image/fishgame/fish.png`)} alt="" height="50"/>
                </Link>)}
              </Col>
            </Row>

            <div style={{ padding: "10px" }}>
              <Weekchart
                title={Language.charttitle}
                min={Language.chartmin}
                day={Language.chartweek}
              />
            </div>

            <Card
              className="drawer_achieve"
              title={
                <Link to={{ pathname: `${locationUrl}achievements` }}>
                  <img
                    src={require("assets/image/achieve_title" +
                      (this.props.route.currentLanguage.value === "english"
                        ? "_en"
                        : "") +
                      ".png")}
                    alt=""
                  />
                </Link>
              }
              headStyle={{ border: "none" }}
              bordered={false}
            >
              <Row gutter={20}>
                <Achieve
                  styles={"drawerPage"}
                  url={locationUrl}
                  lg={8}
                  md={8}
                  sm={8}
                  xs={8}
                />
              </Row>
              <Link to={{ pathname: `${locationUrl}achievements` }}>
                <p>
                  <img src={require("assets/image/achieve_icon.png")} alt="" />
                  {Language.more}
                </p>
              </Link>
            </Card>
          </Fragment>
        )}
      </Drawer>
    );
  }
}

function mapStateToProps({ route, user, auth, translations }) {
  return {
    route,
    user,
    auth,
    translations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload }),
    initUser: payload => dispatch({ type: "INIT", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MyDrawer));
