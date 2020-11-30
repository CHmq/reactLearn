import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Icon, Modal } from "antd";
import intl from "react-intl-universal";

import Popup from "components/common/Popup";
import PopupSelection from "components/PopupSelection";
import PopupSpecial from "components/PopupSpecial";
import ShowVideoModal from "components/common/modal/ShowVideoModal";

import { toast } from "react-toastify";

import user from "components/services/userService";
import NewPage from "components/services/user_commentService";
import main from "components/services/mainService";
import log from "components/services/logService";

import { SUPPORT_LOCALES } from "config/locale.json";

class Adapter extends Component {
  state = {
    visible: false,
    visibleUpgrade: false,
    fileList: [], // 上传文件列表
    list: [], // 储存其他类型返回数据
    verifylist: [], // 储存验证上传数据
    id: "", // 更新图片id,
    info: null,
    comment: [],
  };

  componentDidMount = async () => {
    if (this.props.autoRun) {
      this.action();
    }
  };

  action = async () => {
    const { locationUrl } = this.props.route;
    const { res_type, ref_id, id, item } = this.props;
    if ((res_type || item.res_type || item.type) === "COURSE") {
      window.location = `${locationUrl}course/${
        !!this.props.info ? "info/" : ""
      }${item.display_id || id || item.ref_id}`;
    } else {
      this._action(
        res_type || item.res_type || item.type,
        ref_id || item.ref_id,
        id || item.id,
        true
      );
    }
  };

  _action = async (type, refId, id, setUrl) => {
    if(setUrl) {
      let _route = this.props.route;
      _route.realUrl = "/resource/" + refId;
      log.PV(_route);
    }
    this.setState({ id }, async () => {
      switch (type) {
        case "mix":
          this.setState({
            type,
            visible: true,
          });
          break;
        case "video":
        case "audio":
        case "worksheet":
        case "document":
        case "img_real":
        case "project":
        case "teach_guide":
          this.setState(
            {
              type,
              visible: true,
            },
            () => {
              this.verifyUpload(type, refId, id);
            }
          );
          break;
        case "mc":
        case "download":
          this.setState({
            visible: true,
            type,
            refId,
            info: await main
              .getFullInfo(refId)
              .then((ret) => ret)
              .catch((err) => []),
          });
          break;
        default:
          this.goResource(refId);
          this.setState({ visible: false });
          break;
      }
    });
  };

  //关闭对话框
  onCancel = () => {
    this.setState({
      visible: false,
      data: null,
    });
  };

  //对话框类型判断
  _alter = () => {
    let { type, refId, id, title, arr, fileList } = this.state;
    const { item } = this.props;
    const data = { id, title, refId, arr, fileList };
    switch (type) {
      case "mc":
        return (
          <PopupSelection
            visible={this.state.visible}
            onCancel={this.onCancel}
            id={id}
          />
        );
      case "video":
      case "audio":
      case "worksheet":
      case "document":
      case "img_real":
      case "project":
      case "teach_guide":
        return (
          <PopupSpecial
            onOpend={this.onOpend}
            onCancel={this.onCancel}
            data={this.state.data}
            fileData={data}
            urlId={item.course_id}
            id={this.state.id}
            comment={this.state.comment || []}
          />
        );
      case "download":
        return (this.state.info.item || []).map((_file, index) => {
          return !!_file.file ? (
            <div key="index" style={{ textAlign: "center" }}>
              {!!this.state.docLoading && "Loading ..."}
              {!this.state.docLoading && (
                <a
                  href={_file.file}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={() => {
                    this.setState({ visible: false });
                  }}
                >
                  <h3>{index + 1} 文件已準備好，立即下載！</h3>
                </a>
              )}
            </div>
          ) : null;
        });
      //  break;
      default:
        return;
    }
  };

  //验证是否上传过api;
  async verifyUpload(type, refId, id) {
    const {
      item: { course_id },
    } = this.props;
    if (type == "project" && !!course_id) {
      this.setState({
        verifylist: await NewPage.VerifyUplaod(refId, course_id)
          .then((ret) => {
            console.log(ret);
            this.setState({ id: ret.id, comment: ret.comment });
            return ret;
          })
          .catch((_msg) => {
            //SHOW MESSAGE
            console.log(_msg);
            return [];
          }),
      });
    } else {
      this.state.verifylist = [];
    }
    // console.log(id);
    // const { data } = await NewPage.VerifyUplaod(value);
    if (this.state.verifylist) {
      this.setState({
        data: await main
          .getFullInfo(refId)
          .then((ret) => {
            return ret;
          })
          .catch((_msg) => {
            //SHOW MESSAGE
            console.log(_msg);
            return [];
          }),
      });
      //获取标题api;
      const { name } = this.state.data;
      const { file } = this.state.verifylist;
      if (file) {
        this.setState({
          fileList: [
            {
              uid: this.state.verifylist.id,
              status: "done",
              url: file,
            },
          ],
          title: name,
        });
      }
    }

    this.setState({
      // visible: true,
      type,
      refId,
    });
    this.child._init();
  }

  /**
   *
   * @param {int} res_id
   * @description 預設課件跳轉
   * @returns {}
   */
  async goResource(res_id) {
    let msg = "";
    this.setState({
      list: await user
        .goResource(res_id)
        .then((ret) => {
          return ret;
        })
        .catch((_err) => {
          //SHOW MESSAGE
          console.log(_err + "数据请求加載失敗");
          msg = _err.msg;
          return {};
        }),
    });

    if (Object.keys(this.state.list).length > 0) {
      const { parms, url } = this.state.list;
      this.openPostWindow(parms, url);
    } else {
      toast.error(msg, {
        autoClose: 2000,
        position: toast.POSITION.TOP_CENTER,
      });
    }
  }

  //打开新窗口
  openPostWindow = (parms, url) => {
    var tempForm = document.createElement("form");
    tempForm.id = "tempForm1";
    tempForm.method = "post";
    tempForm.action = url;
    //      if(!navigator.userAgent.match(/(iPod|iPhone|iPad)/i)) {
    //        tempForm.target = "_blank";
    //      }
    if (!!this.props.course && !!this.props.course.lang) {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = "res_lang";
      input.value =
        this.props.course.lang.length > 0
          ? this.props.course.lang.map(({ lang }) => lang).join(",")
          : SUPPORT_LOCALES[this.props.route.currentLocation].lang
              .map(({ value }) => value)
              .join(",");
      tempForm.appendChild(input);
    }
    Object.keys(parms).map((_key) => {
      var input = document.createElement("input");
      input.type = "hidden";
      input.name = _key;
      input.value = parms[_key];
      tempForm.appendChild(input);
      return null;
    });
    if (document.all) {
      tempForm.attachEvent("onsubmit", function () {}); //IE
    }
    document.body.appendChild(tempForm);
    if (document.all) {
      tempForm.fireEvent("onsubmit");
    } else {
      tempForm.dispatchEvent(new Event("submit"));
    }
    tempForm.submit();
    document.body.removeChild(tempForm);
  };

  state = { visible: false };

  showModal = () => {
    const { item } = this.props;
    if (!!item.permit_menu_id) {
      this.setState({
        visibleUpgrade: true,
      });
    }
  };

  onOpend = (ref) => {
    this.child = ref;
  };

  hideModal = () => {
    this.setState({
      visibleUpgrade: false,
    });
  };

  render() {
    const { locationUrl } = this.props.route;
    const { res_type, ref_id, id, nWindow, translations } = this.props;
    const {
      item,
      route: { currentLocation },
    } = this.props;

    const isCourse =
      (res_type || item.res_type || item.type || "") === "COURSE";
    const tAction =
      [
        "mc",
        "project",
        "document",
        "audio",
        "worksheet",
        "mix",
        "video",
        "img_real",
        "download",
        "teach_guide",
      ].indexOf(res_type || item.res_type || item.type || "") > -1;

    const courseType = "course";

    const isMix = this.state.type === 'mix';

    return (
      <React.Fragment>
        {!!item && (item.status !== "LOCKED" || user.getType() === "STAFF") && (
          <React.Fragment>
            {!!isCourse && (
              <Link
                to={{
                  pathname: `${locationUrl}${courseType}/${
                    item.display_id || id || item.ref_id
                  }`,
                  state: { locationUrl },
                  query: { id: item.id },
                }}
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                {this.props.children}
              </Link>
            )}
            {!isCourse && !tAction && !!nWindow && (
              <Link
                target="_blank"
                to={{
                  pathname: `${locationUrl}resource/${id || item.ref_id}`,
                  state: { locationUrl },
                  query: { id: item.id },
                }}
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                {this.props.children}
              </Link>
            )}
            {!isCourse && (!!tAction || (!tAction && !nWindow)) && (
              <React.Fragment>
                <div
                  onClick={this._action.bind(
                    this,
                    res_type || item.res_type || item.type,
                    ref_id || item.ref_id,
                    id || item.id,
                    false
                  )}
                  className={"cursor-pointer"}
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {this.props.children}
                </div>
                {!isMix ? (
                  <Popup
                    visible={this.state.visible}
                    zIndex={666}
                    onCancel={this.onCancel}
                    style={{ backgroundColor: "white", padding: 0 }}
                  >
                    {this._alter()}
                  </Popup>
                ) : (
                  <ShowVideoModal
                    id={this.state.id}
                    visible={this.state.visible}
                    onCancel={this.onCancel}
                  />
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        <Modal
          width={600}
          visible={this.state.visibleUpgrade}
          onOk={this.hideModal}
          onCancel={this.hideModal}
          okText={translations.initDone && intl.get("general.button.confirm")}
          cancelText={
            translations.initDone && intl.get("general.button.cancel")
          }
        >
          <p>
            {currentLocation === "cn"
              ? translations.initDone &&
                intl.getHTML("general.msg.please_upgrade_cn")
              : translations.initDone &&
                intl.getHTML("general.msg.please_upgrade")}
          </p>
        </Modal>
        {!!item && item.status === "LOCKED" && user.getType() !== "STAFF" && (
          <div onClick={this.showModal}>
            <div style={{ position: "absolute", width: "90%", zIndex: "2" }}>
              <div
                style={{
                  margin: "0 auto",
                  width: "30px",
                  color: "#FFF",
                  fontSize: "30px",
                  paddingTop: "30%",
                }}
              >
                <Icon type="lock" />
              </div>
            </div>
            <div style={{ filter: "brightness(50%)" }}>
              {this.props.children}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations,
  };
}

export default connect(mapStateToProps)(Adapter);
