import React, { Component } from "react";
import {
  Button,
  Col,
  Row,
  Select,
  Avatar,
  Card,
  Form,
  Icon,
  Tabs,
  Tag,
  Dropdown,
  Menu,
  Typography
} from "antd";
import { connect } from "react-redux";
import toast from "components/utils/toast";
import intl from "components/utils/language";

import intl1 from "react-intl-universal";

import family_API from "components/services/familyService";
import user_API from "components/services/userService";
import auth_API from "components/services/authService";

// import ParentPwd from "components/common/login/role/parentPwd";
import UserEdit from "components/common/login/role/userEdit";

import parentEditScss from "assets/css/parentEdit.module.scss";

const headerPosition = "home.publicMsg.role.edit";

/**
 * 家長登錄後進行綁定/新增 view
 *
 * @export
 * @class parentEdit
 * @extends {Component}
 */
export class parentEdit extends Component {
  /**
   * state
   *
   *  familyMsg 家庭信息 Object
   *      familyList  非重複的家庭列表 array
   *      currentFamily 當前選中的家庭 string
   *
   *  viewState 視圖狀態 Object
   *      cardState  當前選定的未綁定子女 number
   *      bindLoading   綁定子女button State bool
   *      parentPwdModel   家長輸入密碼模態框 bool
   *
   *  accountMsg
   *      user_id   當前選定的未綁定子女 id string
   *      role   帳號角色
   *
   * @memberof parentEdit
   */
  state = {
    familyMsg: {
      familyList: [],
      currentFamily: "",
      currentRole: {}
    },
    viewState: {
      cardState: null,
      bindLoding: false,
      // parentPwdModel: false,
      userEdit: false
    },
    accountMsg: {
      user_id: "",
      bindState: "",
      role: false
    }
  };

  /**
   * 初始化 familyMsg 信息
   *
   * @memberof parentEdit
   */
  componentDidMount() {
    const { user } = this.props;
    const family_name = Array.from(
      new Set((user.family || []).map(item => item.family_name))
    );
    this.setState({
      familyMsg: { currentFamily: family_name[0], familyList: family_name }
    });
    this.props.updateFileName(["home"]);
  }

  switchState = () => {
    const { bindLoding } = this.state.viewState;
    this.setState({ viewState: { bindLoding: !bindLoding } });
  };

  /** 家庭 Select 切換
   * currentFamily 當前選中的家庭
   */
  familySelectSwitch = currentFamily => {
    const { familyMsg } = this.state;
    this.setState({
      familyMsg: { ...familyMsg, currentFamily, bindLoding: false }
    });
  };

  /** 關閉輸入家長密碼 模態框 */
  // parentModalCancel = parentPwdModel => {
  //   const {
  //     props: {
  //       form: { setFields }
  //     },
  //     state: { viewState }
  //   } = this;
  //   setFields({ pwd: "" });
  //   this.setState({
  //     viewState: { ...viewState, parentPwdModel, bindLoding: false }
  //   });
  // };

  isCurrentUser = (i_userID = null) => {
    return i_userID.toString() === this.props.user.id.toString();
  };

  /** 創建家長列表 */
  createParent = () => {
    return this.createList("parent");
  };

  /** tips 当前选中 Card */
  CardOnClick = ({ index, user_id, bindState, role = false }) => {
    if (!!this.viewState && !!this.viewState.bindLoding) {
      return;
    }
    const {
      state: { accountMsg }
    } = this;
    if (accountMsg.user_id === user_id && accountMsg.bindState === bindState) {
      return this.bindAddOnClick();
    }
    this.setState(
      {
        viewState: { cardState: index },
        accountMsg: { ...accountMsg, user_id, bindState, role }
      },
      () => {
        this.bindAddOnClick();
      }
    );
  };

  /** 跳转到对应页面
   * page: 页面标识
   */
  goPage = ({ page: userState }) => {
    const {
      props: {
        UPDATE_AUTH,
        user: { family }
      },
      state: {
        familyMsg: { currentFamily }
      }
    } = this;
    const { family_id, permit_user: user_id } = family.find(
      item => item.family_name === currentFamily
    );
    UPDATE_AUTH({ userState, AddKidMsg: { family_id, user_id } });
  };

  canBinding = (i_permitKid = null, i_type = "family", i_forceMode = false) => {
    const {
      props: {
        auth: { isParent }
      }
    } = this;
    return (i_forceMode || !isParent) && !i_permitKid && i_type !== "parent";
  };

  acceptFamily = (i_familyID = null) => {
    return family_API
      .accept(i_familyID)
      .then(ret => {
        window.location = this.props.route.realUrl;
      })
      .catch(_err => {
        toast.createToast({
          type: "error",
          msg: _err.msg
        });
      });
  };

  createList = (i_type = "family") => {
    let mType = "";
    switch (i_type.toString().toLowerCase()) {
      case "child":
        mType = "child";
        break;
      case "parent":
        mType = "parent";
        break;
      default:
        return;
    }
    const type = mType;

    const { Meta } = Card;
    const {
      props: {
        auth: { isParent },
        user: { family },
        translations: { initDone },
        UPDATE_AUTH
      },
      state: {
        familyMsg: { currentFamily },
        viewState: { cardState, bindLoding }
      },
      CardOnClick,
      goPage
    } = this;

    return (
      <Row
        className={`${parentEditScss.card_AntD} ${parentEditScss.kid_list}`}
        style={{ height: 400, overflowY: "auto" }}
      >
        {(family || []).filter(
          _user =>
            this.isCurrentUser(_user.permit_user) &&
            _user.family_name === currentFamily &&
            this.isCurrentUser(_user.owner)
        ).length > 0 && (
          <Col xs={24}>
            <Card
              bordered={false}
              className={`${parentEditScss.card}`}
              style={{ cursor: "pointer" }}
              onClick={() =>
                goPage({ page: type === "parent" ? "addParent" : "tips" })
              }
            >
              <Card.Meta
                avatar={<Avatar size={32} icon="user-add" />}
                title={
                  <h4 style={{ margin: "4px 0" }}>
                    {intl.getPlus({
                      initDone,
                      value: `${headerPosition}.${
                        type === "parent" ? "addFamilyKid" : "addKid"
                      }`
                    }) || type.toString().toUpperCase()}
                  </h4>
                }
                style={{ marginBottom: 0 }}
              />
            </Card>
          </Col>
        )}
        {(family || [])
          .sort((a, b) => {
            if (!isParent) {
              return a.permit_kid === b.permit_kid
                ? 0
                : !!a.permit_kid
                ? 1
                : -1;
            }
            return a.create_time === b.create_time
              ? 0
              : a.create_time > b.create_time
              ? 1
              : -1;
          })
          .map((account, index) => {
            return (
              currentFamily === account.family_name &&
              ((type === "parent" && account.relation_id !== "7") ||
                (type === "child" && account.relation_id === "7")) && (
                <Col xs={24} sm={12} key={index}>
                  <Card
                    bordered={false}
                    hoverable={true}
                    className={`${parentEditScss.card} ${index === cardState &&
                      parentEditScss.card_click} ${
                      parentEditScss["sex-" + account.permit_user_sex]
                    } ${this.isCurrentUser(account.permit_user) &&
                      parentEditScss.current} `}
                    actions={
                      account.status !== "PENDING"
                        ? [
                            ...(!this.isCurrentUser(account.permit_user) &&
                            (this.canBinding(account.permit_kid, type) ||
                              !!isParent)
                              ? [
                                  <Button
                                    style={{ color: "#fff" /*,height: 50*/ }}
                                    type="default"
                                    block
                                    onClick={() =>
                                      !this.isCurrentUser(
                                        account.permit_user
                                      ) &&
                                      (this.canBinding(
                                        account.permit_kid,
                                        type
                                      ) ||
                                        !!isParent) &&
                                      CardOnClick({
                                        index,
                                        user_id: account.permit_user,
                                        bindState: account.permit_kid,
                                        role: type === "parent" //account.permit_user === account.owner
                                      })
                                    }
                                    loading={bindLoding}
                                  >
                                    <Icon
                                      style={{ width: "auto" }}
                                      type={
                                        this.canBinding(
                                          account.permit_kid,
                                          type
                                        )
                                          ? "usergroup-add"
                                          : "login"
                                      }
                                    />
                                    {this.canBinding(account.permit_kid, type)
                                      ? intl.getPlus({
                                          initDone,
                                          value: `${headerPosition}.settings.bind`
                                        })
                                      : intl.getPlus({
                                          initDone,
                                          value: `${headerPosition}.settings.enter`
                                        }) +
                                        (type === "parent"
                                          ? intl.getPlus({
                                              initDone,
                                              value: `${headerPosition}.settings.parentVer`
                                            })
                                          : intl.getPlus({
                                              initDone,
                                              value: `${headerPosition}.settings.kidVer`
                                            }))}
                                  </Button>
                                ]
                              : !!isParent
                              ? [
                                  <Button
                                    block
                                    onClick={() =>
                                      this.setState({
                                        viewState: {
                                          ...this.state.viewState,
                                          userEdit: true
                                        }
                                      })
                                    }
                                    rel="noopener noreferrer"
                                  >
                                    <Icon
                                      type="edit"
                                      style={{ width: "auto" }}
                                    />
                                    {intl.getPlus({
                                      initDone,
                                      value: `${headerPosition}.settings.userInformation`
                                    })}
                                  </Button>
                                ]
                              : [
                                /* eslint-disable-next-line jsx-a11y/anchor-is-valid*/
                                  <a
                                    className={"cursor-not-allowed"}
                                    style={{ backgroundColor: "#f5222d" }}
                                  >
                                    <Icon type="lock" />
                                    {`${intl.getPlus({
                                      initDone,
                                      value: `${headerPosition}.settings.isBinding`
                                    })}`}
                                  </a>
                                ]),
                            ...(this.canBinding(account.permit_kid, type, true)
                              ? [
                                  <Dropdown
                                    overlay={
                                      <Menu>
                                        {this.canBinding(
                                          account.permit_kid,
                                          type,
                                          true
                                        ) && (
                                          <Menu.Item>
                                            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid*/}
                                            <a
                                              rel="noopener noreferrer"
                                              onClick={() =>
                                                UPDATE_AUTH({
                                                  userState: "kidAccount"
                                                })
                                              }
                                            >
                                              {`${intl.getPlus({
                                                initDone,
                                                value: `${headerPosition}.settings.bind`
                                              })}`}
                                            </a>
                                          </Menu.Item>
                                        )}
                                      </Menu>
                                    }
                                    placement="topCenter"
                                  >
                                    <Button
                                      block
                                      style={{ color: "#fff" /*,height: 50*/ }}
                                    >
                                      <Icon
                                        style={{ width: "auto" }}
                                        type="setting"
                                      />
                                      {`${intl.getPlus({
                                        initDone,
                                        value: `${headerPosition}.settings.settings`
                                      })}`}
                                    </Button>
                                  </Dropdown>
                                ]
                              : [])
                          ]
                        : this.isCurrentUser(account.permit_user)
                        ? [
                          /* eslint-disable-next-line jsx-a11y/anchor-is-valid*/
                            <a
                              className={"cursor-pointer"}
                              onClick={() => {
                                this.acceptFamily(account.family_id);
                              }}
                            >
                              <Icon type="check" />
                              {`${intl.getPlus({
                                initDone,
                                value: `${headerPosition}.settings.join`
                              })}`}
                            </a>
                          ]
                        : [
                          /* eslint-disable-next-line jsx-a11y/anchor-is-valid*/
                            <a className={"cursor-not-allowed"}>
                              <Icon type="question-circle" />
                              {`${intl.getPlus({
                                initDone,
                                value: `${headerPosition}.settings.beConfirmed`
                              })}`}
                            </a>
                          ]
                    }
                  >
                    <Meta
                      avatar={
                        <Avatar
                          size={84}
                          src={account.permit_img}
                          icon="user"
                          style={{
                            border: `3px solid ${
                              account.permit_user_sex === "F"
                                ? "#ff6363"
                                : "cornflowerblue"
                            }`
                          }}
                        />
                      }
                      title={
                        <React.Fragment>
                          {account.permit_user === account.owner && (
                            <Tag
                              color="gold"
                              style={{ marginRight: "0.3rem" }}
                            >{`${intl.getPlus({
                              initDone,
                              value: `${headerPosition}.parent.role`
                            })}`}</Tag>
                          )}
                          {type === "parent" && (
                            <Tag
                              color={
                                account.permit_user_sex === "F" ? "red" : "blue"
                              }
                            >
                              {intl.getPlus({
                                initDone,
                                value: `${headerPosition}.parent.${account.relation.toLowerCase()}`
                              })}
                            </Tag>
                          )}
                          {type === "child" && (
                            <Tag
                              color={
                                account.permit_kid
                                  ? account.permit_user_sex === "F"
                                    ? "magenta"
                                    : "cyan"
                                  : "#f50"
                              }
                            >
                              {intl.getPlus({
                                initDone,
                                value: `${headerPosition}.kid.role.${
                                  account.membership === 'STANDARD' ? "isBinding" : "unbound"
                                }`
                              })}
                            </Tag>
                          )}
                          {this.isCurrentUser(account.permit_user) && (
                            <Icon
                              type="check-circle"
                              theme="twoTone"
                              twoToneColor="#52c41a"
                            />
                          )}
                        </React.Fragment>
                      }
                      description={
                        <React.Fragment>
                          <p style={{ ...{ marginBottom: 0, color: "black" } }}>
                            {account.permit_user_name}
                          </p>
                          {account.permit_kid_acc && (
                            <Typography.Paragraph ellipsis title={account.permit_kid_acc}>
                              {account.permit_kid_acc}
                            </Typography.Paragraph>
                          )}
                        </React.Fragment>
                      }
                    />
                  </Card>
                </Col>
              )
            );
          })}
      </Row>
    );
  };

  /** 創建子女列表 */
  createFamilyList = () => {
    return this.createList("child");
  };

  /** 綁定子女 erros 處理
   * params
   *    code errors result碼
   */
  bindAddErrors = code => {
    const {
      state: {
        viewState: { bindLoding }
      }
    } = this;
    const errors = new Map().set(203, () =>
      toast.createToast({
        type: "error",
        msg: "該帳號已經綁定了kid帳戶!",
        onClose: () => this.setState({ viewState: { bindLoding: !bindLoding } })
      })
    );
    return errors.get(code)
      ? errors.get(code)()
      : toast.createToast({
          type: "error",
          msg: "發生了未知的錯誤,請您稍後再試!",
          onClose: () =>
            this.setState({ viewState: { bindLoding: !bindLoding } })
        });
  }
    
  /** 绑定子女 */
  bindAddOnClick = async () => {
    const {
      props: {
        auth: { kid_token, isParent },
        user: { id },
        translations
      },
      state: {
        viewState,
        viewState: { bindLoding },
        accountMsg: { user_id, bindState, role }
      },
      bindAddErrors
    } = this;
    this.setState({
      viewState: {
        ...viewState,
        bindLoding: !bindLoding
      }
    });
    const _fn = function(value) {
      return translations.initDone && intl1.get("home.publicMsg.role.edit.parentEditMes."+value)
    }
    const Language = {
      accountNull: _fn("accountNull"),
      accountCurrent: _fn("accountCurrent"),
      change: _fn("change"),
      bind: _fn("bind"),
      Coming: _fn("Coming"),
      parents: _fn("parents"),
      kids: _fn("kids"),
      home: _fn("home")
    }
    if (!user_id)
      return toast.createToast({
        msg: Language.accountNull,
        onClose: () =>
          this.setState({
            viewState: { ...viewState, bindLoding }
          })
      });
    try {
      if (user_id === id) {
        return toast.createToast({
          msg: Language.accountCurrent,
          onClose: () =>
            this.setState({
              viewState: { ...viewState, bindLoding }
            })
        });
      }

      // 驗證是否是家長賬號
      // if (role) {
      //   return this.setState({
      //     viewState: { ...viewState, parentPwdModel: true, bindLoding: true }
      //   });
      // }

      // 是否是未綁定賬號
      if (!isParent && !bindState) {
        await family_API.bindChlidren({ kid_token, user_id });
      }

      await user_API.swap({ user_id });
      toast.createToast({
        type: "success",
        // msg: `${isParent || bindState ? "切換" : "綁定"}成功，即將進入${
        //   role ? "「家長版」" : "「兒童版」"
        // }主頁`,
        msg: `${isParent || bindState ? Language.change : Language.bind}`+Language.Coming+`${
          role ? Language.parents :  Language.kids
        }`+ Language.home,
        onClose: () => {
          this.setState({
            viewState: { ...viewState, bindLoding }
          });
          window.location = `/${this.props.route.currentLocation}/${this.props.route.currentLanguage.url}`;
        }
      });
      localStorage.setItem("show", true);
    } catch (error) {
      console.log(error);
      bindAddErrors(error.result);
    }
  };

  render() {
    const {
      createParent,
      createFamilyList,
      // bindAddOnClick,
      // goPage,
      // parentModalCancel,
      state: {
        viewState: { bindLoding, /** parentPwdModel, cardState*/ },
        // accountMsg: { user_id },
        familyMsg: { familyList, currentFamily }
      },
      props: {
        // user: { family },
        translations: { initDone },
        initUser
      }
    } = this;

    const { Option } = Select;
    return (
      <React.Fragment>
        <h2
          style={{
            textAlign: "center",
            backgroundColor: "#0050B3",
            color: "#fff",
            padding: "10px 0"
          }}
        >
          {intl.getPlus({
            initDone,
            value: `${headerPosition}.title`
          }) +
            (user_API.getType() === "STAFF"
              ? "(" +
                intl.getPlus({
                  initDone,
                  value: `${headerPosition}.parent.teacher`
                }) +
                ")"
              : "")}
        </h2>

        <div
          style={{
            textAlign: "center",
            padding: 10,
            marginBottom: 0
          }}
        >
          <h2>
            {!!this.state.showList ? (
              <Select
                value={currentFamily}
                style={{ minWidth: 175 }}
                onChange={ret => {
                  this.familySelectSwitch(ret);
                  this.setState({ showList: false });
                }}
              >
                {familyList.map(item => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))}
              </Select>
            ) : (
              <React.Fragment>
                <Icon type="home" /> {familyList[0]}
                {familyList.length > 1 && (
                  <Button
                    block
                    onClick={() => {
                      this.setState({ showList: true });
                    }}
                  >
                    <Icon type="edit" style={{ width: "auto" }} />
                  </Button>
                )}
              </React.Fragment>
            )}
          </h2>
        </div>
        <Tabs
          className={`${parentEditScss.parentEditList}`}
          defaultActiveKey="Parent"
          style={{ marginBottom: "2rem" }}
          size={"large"}
        >
          <Tabs.TabPane
            tab={
              <span style={{ textAlign: "center" }}>
                {intl.getPlus({
                  initDone,
                  value: `${headerPosition}.kid.kidTitle`
                })}
              </span>
            }
            key="STUDENT"
          >
            {createFamilyList()}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span style={{ textAlign: "center" }}>
                {intl.getPlus({
                  initDone,
                  value: `${headerPosition}.parent.parentTitle`
                })}
              </span>
            }
            key="PARENT"
          >
            {createParent()}
          </Tabs.TabPane>
        </Tabs>
        <Row
          type="flex"
          gutter={40}
          style={{ padding: "0 50px" }}
          justify="center"
        >
          <Col>
            <Button
              style={{ backgroundColor: "#ff4d4f", color: "#fff" }}
              onClick={() => {
                auth_API.logout().then(ret => {
                  window.location = this.props.route.locationUrl;
                });
              }}
              loading={bindLoding}
            >
              {intl.getPlus({
                initDone,
                value: `logout`
              }) || "Logout"}
            </Button>
          </Col>
        </Row>
        {this.state.viewState.userEdit && (
          <UserEdit
            editClose={() => {
              user_API.me(true).then(_user => initUser(_user));
              this.setState({
                viewState: { ...this.state.viewState, userEdit: false }
              });
            }}
            user={this.props.user}
            translations={this.props.translations}
          />
        )}
      </React.Fragment>
    );
  }
}

/** redux 數據獲取
 * user 用戶信息
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
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    initUser: payload => dispatch({ type: "INIT", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(parentEdit));
