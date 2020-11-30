import React, { Component } from "react";
import { Icon, Modal } from "antd";

import staff from "components/services/staffService";
// import DraggerImgUploading from "components/common/UploadingFile";

import styleCss from "assets/css/Memulistwarp.module.scss";

/**
 * 属于 Memulist 组件的外壳
 * 目前只有编辑的状态
 **/
class ResourceWrap extends Component {
  $$mount = false;

  state = {
    edit: false,
  };

  constructor(props) {
    super(props);
    this.updatePermit();
  }

  componentDidMount = async () => {
    this.$$mount = true;
    this.updatePermit();
  };

  componentWillUnmount = async () => {
    this.$$mount = false;
  };

  updatePermit = () => {
    const { type, school_id } = this.props.item;
    let permitUpdate =
      [
        "mc",
        "project",
        "document",
        "audio",
        "worksheet",
        "video",
        "img_real",
        "download",
        "mix"
      ].indexOf(type) > -1 &&
      staff.checkRPermit({
        module: "resource",
        ctrl: "main",
        action: "update",
      }) &&
      staff.checkMerchant(school_id);
    if (this.$$mount) {
      this.setState({ edit: permitUpdate });
    }
  };

  editDom = (e) => {
    e.stopPropagation();
    typeof this.props.open === "function" ? this.props.open() : void 0;
  };

  // 校本资料上传封面
  setbgImg = (e) => {
    e.stopPropagation();

    typeof this.props.open2 === "function" ? this.props.open2() : void 0;
  };

  render() {
    const { edit } = this.state;

    return (
      <>
        <div className={styleCss.warp} style={{ color: "red" }}>
          {!!edit ? (
            <>
              <div
                className={`${styleCss.edit} ${styleCss.ab}`}
                // onClick={this.editDom}
              >
                <div onClick={this.editDom}>
                  <Icon type="edit" />
                </div>
                <div onClick={this.setbgImg}>
                  <Icon type="camera" />
                </div>
              </div>
            </>
          ) : null}
          <div>{this.props.children}</div>
        </div>
      </>
    );
  }
}

export default ResourceWrap;
