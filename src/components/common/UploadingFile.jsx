import React from "react";
import {
  Upload,
  Icon,
  Modal,
  Button,
  Row,
  Col,
  Checkbox,
  Divider,
  message,
} from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { toast, Flip } from "react-toastify";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

import course from "components/services/courseService";
import school from "components/services/school";
// import user from "components/services/userService";

import SetDefaultBg from "./uploadComponents/setDefaultBg";

import { fileTypeOf } from "components/utils/type";

class UploadingFile extends React.Component {
  /** state
   *  previewVisible
   *      模態框狀態更新  bool
   *
   *  previewImage
   *      點擊 預覽圖片保存的值 base64 || url string
   *
   *  fileList
   *      文件列表 array
   *
   *  uploading
   *      上傳按鈕狀態更新 bool
   */
  state = {
    previewVisible: false,
    cropperVisible: false,
    previewImage: "",
    fileList: [],
    uploading: false,
    $$premit: [],
    srcCropper: null,
    targetID: "",
    submitDisabled: false,
    checkConfirm: false,
    checkedDefaultBg: false,
    curBgIndex: null,
  };

  componentDidMount() {
    const { bgId } = this.props;
    if (bgId) {
      this.setState({
        curBgIndex: parseInt(this.props.bgId, 10),
        checkedDefaultBg: true,
      });
    }
  }

  /** 模态框状态更新 */
  handleCancel = () => this.setState({ previewVisible: false });

  /** 点击图片或者预览图片回调 */
  handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = file.thumbUrl;
    }
    /** 更新图片base64编码 并显示模态框 用于图片展示 */
    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };

  /** 切換預覽視圖 */
  handleChange = async ({ fileList }) => {
    this.setState({ fileList });
  };

  getUploadPermit = (file) => {
    const { URLid, type, translations } = this.props;
    const { fileList, updateCallback } = this.state;
    this.setState({ uploading: !fileList.length });

    if (['courseFile_add', 'courseFile_update', 'adapter'].includes(type)) {
      let name = file.name.toLowerCase();
      const fileType = type === 'adapter' ? [".mp4",".mov"] :
        [".gif",".jpg",".jpeg",".png",".mp4",".ppt",".pptx",".ppsx",".mov",".mp3",".pdf",".doc",".docx",".xls",".xlsx"]
      const flag = fileTypeOf(name, fileType);
      const isLt100M = file.size / 1024 / 1024 / 1024 < 1;
      !flag &&
        Modal.error({
          zIndex: 100000,
          title: type === 'adapter' ? translations.initDone && intl.get(`general.msg.upload_type3`) : translations.initDone && intl.get(`general.msg.upload_type`),
        });
      flag &&
        !isLt100M &&
        Modal.error({
          zIndex: 100000,
          title: translations.initDone && intl.getHTML(`general.msg.file_size`),
        });
      this.setState({ submitDisabled: !(flag && isLt100M) });

      if ((type === "courseFile_add" || type === 'adapter' ) && flag && isLt100M) {
        school.addItem(URLid).then((ret) => {
          this.setState(
            {
              $$permit: course.getResourceItemPermit(file, { id: ret, is_adapter: type === 'adapter' ? "Y" : "N" }),
            },
            () => {
              this.state.$$permit.then(() => {
                this.setState({ uploading: false });
              });
            }
          );
        });
      } else {
        this.setState(
          {
            $$permit: course.getResourceItemPermit(file, { id: URLid }),
          },
          () => {
            this.state.$$permit.then(() => {
              this.setState({ uploading: false });
            });
          }
        );
      }
    } else if (type === "schoolResouce_preview") {
      this.setState({
        $$permit: course.getSchoolResourcePermit(file, {
          id: URLid,
          section: type,
        }),
        uploading: false,
      });
    } else {
      this.setState({
        $$permit: course.getResourcePermit(file, { id: URLid, section: type }),
        uploading: false,
      });
    }

    if (
      type === "banner" ||
      type === "file" ||
      type === "schoolResouce_preview"
    ) {
      let reader = new FileReader();
      const image = new Image();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        image.src = reader.result;
        image.onload = () => {
          this.setState({
            srcCropper: e.target.result, //cropper的图片路径
            selectImgName: file.name, //文件名称
            cropperVisible: true, //打开控制裁剪弹窗的变量，为true即弹窗
          });
          if (this.refs.cropper) {
            this.refs.cropper.replace(e.target.result);
          }
        };
      };
    }
    return false;
  };

  /** 上传头像 */
  uploadingFile = async () => {
    // 更新上傳按鈕狀態
    const { uploading, checkedDefaultBg } = this.state;
    const { translations, updateCallback } = this.props;
    this.setState({ uploading: true });

    const id = this.createToast({
      type: "info",
      msg: translations.initDone && intl.get(`general.msg.uploading`),
      autoClose: false,
      hideProgressBar: true,
    });
    try {
      let _permit = await this.state.$$permit;

      await course
        .uploadFile(_permit, this.state.fileList[0].originFileObj, {
          is_bg: checkedDefaultBg ? "Y" : "",
        })
        .then(ret => {
          if (updateCallback) {
            updateCallback();
          }
          if(this.props.onCancel) this.props.onCancel();
          this.createUpdateToast({
            id,
            render:
              translations.initDone && intl.get(`general.msg.upload_success`),
            type: toast.TYPE.SUCCESS,
            position: "top-center",
            transition: Flip,
          });
        })
        .catch((error) => {
          if (!!error) {
            this.uploadingErrors({ result: error.result, id, uploading });
          }
          return new Promise((resolve, reject) => {
            reject("UPLOAD_ERROR");
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  // 修改背景圖
  // uploadingBg = async () => {
  //   const { translations, URLid, apiFun } = this.props;

  //   const { checkedDefaultBg, curBgIndex } = this.state;

  //   if (apiFun) {
  //     apiFun(checkedDefaultBg ? curBgIndex : "");
  //     return;
  //   }

  //   try {
  //     await course.uploadBgFile(URLid, checkedDefaultBg ? curBgIndex : "");
  //     message.success(
  //       translations.initDone && intl.get(`general.msg.update_success`),
  //       () => typeof this.props.onCancel === "function" && this.props.onCancel()
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     message.error(
  //       translations.initDone && intl.get(`general.msg.update_error`)
  //     );
  //   }
  // };

  /** 上傳的異常處理 */
  uploadingErrors = ({ result, id, uploading }) => {
    const { translations } = this.props;
    switch (result) {
      case 21:
        return this.createUpdateToast({
          id,
          render: translations.initDone && intl.get(`general.msg.no_right`),
          uploading,
        });
      default:
        return this.createUpdateToast({
          id,
          render: translations.initDone && intl.get(`general.msg.c`),
          uploading,
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
    onClose,
  }) => {
    return toast[type](msg, {
      position,
      autoClose,
      hideProgressBar,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onOpen,
      onClose,
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
    onClose = () => this.setState({ uploading }),
  }) => {
    toast.update(id, {
      render,
      position,
      type,
      transition,
      autoClose,
      hideProgressBar,
      onOpen,
      onClose,
    });
  };

  saveImg() {
    let file = this.dataURLtoFile(
      this.refs.cropper.getCroppedCanvas().toDataURL(),
      this.state.selectImgName.split(".")[0]
    );
    let fileList = this.state.fileList;
    fileList[0].originFileObj = file;
    fileList[0].thumbUrl = this.refs.cropper.getCroppedCanvas().toDataURL();
    this.setState({ fileList, cropperVisible: false });
  }

  //base64轉file
  dataURLtoFile(dataurl, filename = "file") {
    let arr = dataurl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let suffix = mime.split("/")[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    u8arr.uid = 1;
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], `${filename}.${suffix}`, { type: mime });
  }

  /** 渲染元素 */
  render() {
    const {
      previewVisible,
      previewImage,
      fileList,
      uploading,
      checkedDefaultBg,
    } = this.state;
    const { translations, type, aspectRatio } = this.props;

    // 多语言
    const _fn = function (value) {
      return (
        translations.initDone && intl.get("course_1.UploadingFile." + value)
      );
    };
    const Language = {
      tip: _fn("tip"),
      btn: _fn("btn"),
      toCut: _fn("toCut"),
      uploadDefaultImg: _fn("uploadDefaultImg"),
      cancel: _fn("cancel"),
    };

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">{this.props.tip || Language.tip}</div>
      </div>
    );
    const style = {
      preview: {
        width: 396,
        height: 96,
        overflow: "hidden",
        display: "inline-block",
        marginRight: 20,
        marginBottom: 20,
      },
    };

    let accept = {
      file: "image/*",
      video: "video/*",
      banner: "image/*",
      courseFile_add:
        ".gif,.jpg,.jpeg,.png,.mp4,.ppt,.pptx,.ppsx,.mov,.mp3,.pdf,.doc,.docx,.xls,.xlsx",
      adapter: ".mp4,.mov",
      courseFile_update:
        ".gif,.jpg,.jpeg,.png,.mp4,.ppt,.pptx,.ppsx,.mov,.mp3,.pdf,.doc,.docx,.xls,.xlsx",
    };

    return (
      <div className="clearfix">
        <Row type="flex" justify="space-around">
          <Upload
            accept={accept[type] || "*"}
            listType="picture-card"
            fileList={fileList}
            onPreview={this.handlePreview}
            onChange={this.handleChange}
            beforeUpload={this.getUploadPermit}
            style={{ height: 200, width: 200 }}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
          <Modal
            visible={previewVisible}
            footer={null}
            onCancel={this.handleCancel}
          >
            <img alt="example" style={{ width: "100%" }} src={previewImage} />
          </Modal>
          <Modal
            visible={this.state.cropperVisible}
            onOk={this.saveImg.bind(this)}
            onCancel={() => {
              this.setState({ cropperVisible: false });
            }}
            okText={translations.initDone && intl.get("general.button.confirm")}
            cancelText={
              translations.initDone && intl.get("general.button.cancel")
            }
            maskClosable={false}
          >
            <p>
              {translations.initDone &&
                intl.get("home.publicMsg.avatar.preview")}
              ：
            </p>
            <div className="previewContainer" style={style.preview}></div>
            <Cropper
              src={this.state.srcCropper} //图片路径，即是base64的值，在Upload上传的时候获取到的
              ref="cropper"
              style={{ height: 400, width: "100%" }}
              aspectRatio={aspectRatio}
              zoomable={false}
              viewMode={1} //定义cropper的视图模式
              movable={true}
              guides={true} //显示在裁剪框上方的虚线
              rotatable={false} //是否旋转
              cropBoxResizable={true} //是否可以拖拽
              cropBoxMovable={true} //是否可以移动裁剪框
              center={true}
              preview=".previewContainer"
            />
          </Modal>
        </Row>
        <Row type="flex" justify="center">
          {(type === "banner" ||
            type === "file" ||
            type === "schoolResouce_preview") &&
            (fileList.length !== 0 ? (
              <p
                style={{ fontSize: 12, cursor: "pointer" }}
                onClick={() => {
                  this.setState({ cropperVisible: true });
                }}
              >
                {Language.toCut}
              </p>
            ) : (
              <p style={{ fontSize: 12 }}>
                {translations.initDone &&
                  intl.get("general.msg.recommend_size")}
                : {type === "banner" ? "1980 x 480px" : "600 x 450px"}
              </p>
            ))}
          {type === 'adapter' && (
            <p style={{ fontSize: 12 }}>
              {translations.initDone && intl.get(`general.msg.upload_type3`)}
            </p>
          )}
          {(type === "courseFile_add" || type === "courseFile_update") && (
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: 12 }}>
                {translations.initDone && intl.get(`general.msg.upload_type`)}
              </p>
              <p
                style={{ fontSize: 12 }}
                dangerouslySetInnerHTML={{
                  __html:
                    translations.initDone &&
                    intl.get(`general.msg.upload_website`),
                }}
              />
              <p
                style={{ fontSize: 12 }}
                dangerouslySetInnerHTML={{
                  __html:
                    translations.initDone && intl.get(`general.msg.upload_app`),
                }}
              />
            </div>
          )}
        </Row>
        <Row type="flex" justify="center">
          <Checkbox
            onChange={({ target: { checked } }) =>
              this.setState({ checkConfirm: checked })
            }
            style={{ fontSize: 12, marginBottom: "1em" }}
          >
            {translations.initDone && intl.get(`general.msg.please_check`)}
          </Checkbox>
        </Row>
        <Row type="flex" justify="space-around">
          <Button
            type="primary"
            onClick={this.uploadingFile}
            loading={uploading}
            disabled={!this.state.checkConfirm || this.state.submitDisabled}
          >
            {Language.btn}
          </Button>
        </Row>

        {
          // 僅用於校本課程是否展示背景圖判斷
          !this.props.useBg &&
            // 其他的判斷條件
            (this.props.type === "file" ||
              this.props.type === "schoolResouce_preview") && (
              // <>
              //   <Row type="flex" justify="space-around">
              //     <Divider />
              //   </Row>
              //   <Row type="flex" justify="space-around">
              //     <Checkbox
              //       checked={checkedDefaultBg}
              //       onChange={(e) => {
              //         const { checked } = e.target;
              //         this.setState({ checkedDefaultBg: checked });
              //         if (!checked) {
              //           this.setState({ curBgIndex: null });
              //         }
              //       }}
              //     >
              //       {Language.uploadDefaultImg}
              //     </Checkbox>
              //   </Row>
              //   <Row
              //     type="flex"
              //     justify="space-around"
              //     gutter={16}
              //     style={{ margin: "1rem 0" }}
              //   >
              //     {imageList.map((item, index) => (
              //       <Col
              //         span={8}
              //         style={{
              //           margin: "0 0 0.5rem 0",
              //           cursor: "point",
              //         }}
              //         key={index}
              //         onClick={() => {
              //           this.setState({ curBgIndex: index + 1 }, () => {
              //             const { curBgIndex } = this.state;
              //             if (curBgIndex) {
              //               this.setState({ checkedDefaultBg: true });
              //             }
              //           });
              //         }}
              //       >
              //         <img
              //           src={item.src}
              //           alt=""
              //           width="100%"
              //           height="100%"
              //           style={{
              //             outline:
              //               this.state.curBgIndex === index + 1
              //                 ? "2.5px #39c5bb solid"
              //                 : "",
              //           }}
              //         />
              //       </Col>
              //     ))}
              //   </Row>
              //   <Row type="flex" justify="space-around">
              //     <Button
              //       type="primary"
              //       onClick={this.uploadingBg}
              //       loading={uploading}
              //     >
              //       {Language.btn}
              //     </Button>
              //     <Button type="primary" onClick={this.props.onCancel}>
              //       {Language.cancel}
              //     </Button>
              //   </Row>
              // </>
              <SetDefaultBg
                bgId={this.props.bgId}
                uploading={uploading}
                onCancel={this.props.onCancel}
                URLid={this.props.URLid}
                apiFun={this.props.apiFun}
              />
            )
        }
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
    translations,
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
)(UploadingFile);
