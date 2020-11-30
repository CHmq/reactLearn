import React from "react";
import { Upload, Icon, Button, Row, Col } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { toast, Flip } from "react-toastify";

import article from "components/services/articleService";

class UploadingDocumentFile extends React.Component {
  /** state
   *  previewVisible
   *      模態框狀態更新  bool
   *
   *  fileList
   *      文件列表 array
   *
   *  uploading
   *      上傳按鈕狀態更新 bool
   */
  state = {
    previewVisible: false,
    previewImage: "",
    fileList: [],
    uploading: false,
    $$premit: []
  };

  /** 模态框状态更新 */
  handleCancel = () => this.setState({ previewVisible: false });

  /** 点击图片或者预览图片回调 */
  // handlePreview = async file => {
  //   if (!file.url && !file.preview) {
  //     file.preview = file.thumbUrl;
  //   }
  //   /** 更新图片base64编码 并显示模态框 用于图片展示 */
  //   this.setState({
  //     previewImage: file.url || file.preview,
  //     previewVisible: true
  //   });
  // };

  /** 切換預覽視圖 */
  handleChange = async ({ fileList }) => this.setState({ fileList });

  getUploadPermit = file => {
    const data = {
      'app_type': 'KID_WEB'
    };
    // const { URLid, type } = this.props;
    this.setState({$$permit : article.getUserRecordAddPermit(file, data)});
    return false;
  };

  /** 上传文件 */
  uploadingFile = async () => {
    // 更新上傳按鈕狀態
    const { uploading } = this.state;
    const { translations } = this.props;
    this.setState({ uploading: true });

    const id = this.createToast({
      type: "info",
      msg: translations.initDone && intl.get(`general.msg.uploading`),
      autoClose: false,
      hideProgressBar: true
    });

    try {
      let _permit = await this.state.$$permit;
      await article
        .uploadFile(_permit, this.state.fileList[0].originFileObj)
        .then(ret => {
          this.props.onCancel();
        })
        .catch(error => {
          if (!!error) {
            this.uploadingErrors({ result: error.result, id, uploading });
          }
          return new Promise((resolve, reject) => {
            reject("UPLOAD_ERROR");
          });
        });

      this.createUpdateToast({
        id,
        render: translations.initDone && intl.get(`general.msg.upload_success`),
        type: toast.TYPE.SUCCESS,
        position: "top-center",
        transition: Flip,
        onClose: () => this.setState({ uploading })
      });
    } catch (error) {
      console.log(error);
    }
  };

  /** 上傳的異常處理 */
  uploadingErrors = ({ result, id, uploading }) => {
    const { translations } = this.props;
    switch (result) {
      case 21:
        return this.createUpdateToast({
          id,
          render: translations.initDone && intl.get(`general.msg.no_right`),
          uploading
        });
      default:
        return this.createUpdateToast({
          id,
          render: translations.initDone && intl.get(`general.msg.upload_failed`),
          uploading
        });
    }
  };

  /** 生成 toast 提示控件
   * type 展示的消息類型
   * msg  消息
   * onOpen,onClose 控件渲染/銷毀的回調函數
   * 其餘請看API 文檔
   */

  createToast = ({
    type,
    msg,
    position = "top-center",
    autoClose = 3000,
    hideProgressBar = false,
    onOpen,
    onClose
  }) => {
    return toast[type](msg, {
      position,
      autoClose,
      hideProgressBar,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onOpen,
      onClose
    });
  };

  /** 生成 toast 更新組件
   * type 展示的消息類型
   * msg  消息
   * onOpen,onClose 控件渲染/銷毀的回調函數
   * 其餘請看API 文檔
   */
  createUpdateToast = ({
    id,
    render,
    position = "top-right",
    type = toast.TYPE.ERROR,
    transition,
    autoClose = 3000,
    hideProgressBar = false,
    onOpen,
    uploading,
    onClose = () => this.setState({ uploading })
  }) => {
    toast.update(id, {
      render,
      position,
      type,
      transition,
      autoClose,
      hideProgressBar,
      onOpen,
      onClose
    });
  };

  /** 渲染元素 */
  render() {
    const { fileList, uploading } = this.state;
    const { translations } = this.props;
    // 多语言
    const _fn = function(value) {
      return (
        translations.initDone && intl.get("course_1.UploadingFile." + value)
      );
    };
    const Language = {
      tip: _fn("tip"),
      btn: _fn("btn")
    };

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上傳文件</div>
      </div>
    );

    return (
      <div className="clearfix">
        <Row type="flex" justify="space-around">
          <Col span={12}>
            <Upload
              accept=".doc,.docx,.pdf"
              fileList={fileList}
              // onPreview={this.handlePreview}
              onChange={this.handleChange}
              beforeUpload={this.getUploadPermit}
              onRemove={this.handleRemove}
              listType="picture-card"
              style={{ height: 200 }}
            >
              {fileList.length >= 1 ? null : uploadButton}
            </Upload>
          </Col>
        </Row>
        <Row type="flex" justify="space-around">
          <Button
            type="primary"
            onClick={this.uploadingFile}
            loading={uploading}
          >
            {Language.btn}
          </Button>
        </Row>
      </div>
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
// function mapDispatchToProps(dispatch) {

// }

export default connect(
  mapStateToProps
  // mapDispatchToProps
)(UploadingDocumentFile);
