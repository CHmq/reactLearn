import React, { Component } from "react";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { Button, Icon, Row, Col, Upload, Modal, Spin, Tooltip } from "antd";
import { Document, Page, pdfjs } from "react-pdf";
import exploration from "components/services/user_commentService";
import course from "components/services/courseService";
import toast from "components/utils/toast";
import FilePreview from "components/resource/FilePreview";
import CommentList from "components/course/CommentList";
import Video from "components/common/Video";
// import VideoPlayer from "components/common/VideoPlayer";
import { Textfit } from "react-textfit";

import { fileTypeOf } from "components/utils/type";

import styles from "assets/css/PopupSpecial.module.scss";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class Exploration extends Component {
  static defaultProps = {
    fileList: [], //初始化上传列表
  };
  getUploadPermit = (file) => {
    let name = file.name.toLowerCase();
    // 類型判斷
    const flag = fileTypeOf(name, [
      ".gif",
      ".jpg",
      ".jpeg",
      ".png",
      ".mp4",
      ".mov",
      ".pdf",
    ]);
    if (!flag) {
      Modal.error({
        zIndex: 100000,
        title: this._fn("general.msg.upload_type2"),
      });
    }
    this.setState({ submitDisabled: !flag });
    const refId = this.props.fileData.refId;
    const courseID = this.props.urlId;
    const data = {
      course_id: courseID,
      res_id: refId,
      id: (this.props.fileData.fileList || []).length > 0 ? this.props.id : "",
      app_type: "KID_WEB",
    };
    if (!!data.id) {
      this.setState({ $$permit: course.getUserRecordUpdatePermit(file, data) });
    } else {
      this.setState({ $$permit: course.getUserRecordAddPermit(file, data) });
    }
    return false;
  };

  constructor(props) {
    super(props);
    this.state = {
      fileList: [], //初始化上传列表
      uploading: false, //上传状态
      id: "", //验证上传id
      imgbase: "", //base64图
      previewVisible: false, //查看图片状态
      previewImage: "", //查看图片
      modaliImg: true, //判断图片或视频
      title: "",
      visible: false,
      submitDisabled: false,
    };
  }
  componentDidMount() {
    this.props.onOpend(this);
    // this.setState({
    //   fileList: this.props.fileData.fileList || []
    // });
    // console.log(this.props.fileData);
  }
  _init = () => {
    const {
      data: { teaching_point, item },
    } = this.props;

    // if (!teaching_point || !item) {
    //   return;
    // }
    let [newItem] = item.filter((item) => !!item.file);
    this.setState({
      file: !!teaching_point
        ? teaching_point
        : !!newItem
        ? { streamingUrl: newItem.streaming_url, url: newItem.file }
        : "",
      fileName: !teaching_point ? (!!newItem ? newItem.file_name : "") : "",
      type: !!teaching_point ? "text" : "",
    });
  };

  _fn = (value) => {
    const { translations } = this.props;
    return translations.initDone && intl.get(value);
  };

  //关闭彈出框
  onCancel = () => {
    //this.verifyUpload(this.props.fileData.refId);

    this.setState({ file: "", type: "", visible: true }, () => {
      this.props.onCancel();
    });
  };

  async verifyUpload(refId) {
    const { urlId } = this.props;
    this.setState({
      verifylist: await exploration
        .VerifyUplaod(refId, urlId)
        .then((ret) => {
          return ret;
        })
        .catch((_msg) => {
          //SHOW MESSAGE
          console.log(_msg);
          return [];
        }),
    });
    if (this.state.verifylist.file) {
      const filelist = [
        {
          uid: "-1",
          status: "done",
          url: this.state.verifylist.file,
        },
      ];
      this.setState({
        fileList: filelist,
      });
    } else {
      // const filelist = [];
      this.setState({
        fileList: [],
      });
    }
    this.setState({
      uploading: false,
    });
  }

  //分享
  _share = () => {
    console.log("分享");
  };

  //上传
  handleUpload = async () => {
    try {
      this.setState({ uploading: true });
      let _permit = await this.state.$$permit;
      await course
        .uploadFile(_permit, this.state.fileList[0].originFileObj)
        .then((ret) => {
          toast.createToast({
            type: "success",
            msg: this._fn("general.msg.upload_success"),
          });
          this.props.onCancel();
          this.setState({ uploading: false });
        })
        .catch((error) => {
          return new Promise((resolve, reject) => {
            reject("UPLOAD_ERROR");
          });
        });
    } catch (error) {
      console.log(error);
    }
  };

  //base64转换
  getBase64 = (file) => {
    return new Promise(function (resolve) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(this.result);
      };
    });
  };

  //查看文件
  handlePreview = (file) => {
    this.setState({
      modaliImg: true,
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });

  //视频缩略图
  getVideoImage = (file, call) => {
    if (file && file.type.indexOf("video/") === 0) {
      var video = document.createElement("video");
      video.currentTime = 1;
      video.src = URL.createObjectURL(file);
      video.addEventListener("loadeddata", function () {
        var canvas = document.createElement("canvas"); // 创建一个画布
        canvas.width = video.videoWidth * 0.8;
        canvas.height = video.videoHeight * 0.8;
        canvas
          .getContext("2d")
          .drawImage(video, 0, 0, canvas.width, canvas.height); // getContext:设置画布环境；drawImage:画画
        var image = canvas.toDataURL("image/jpeg");
        typeof call == "function" && call.call(file, image);
      });
    }
  };

  setIcon = (item) => {
    let str = "";
    if (!!item.file) {
      const file = item.file.toLowerCase();
      switch (true) {
        case file.endsWith(".mp4"):
          str = "video-camera";
          break;
        case file.endsWith(".jpeg") ||
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".gif"):
          str = "picture";
          break;
        case file.endsWith(".mp3"):
          str = "audio";
          break;
        case file.endsWith(".pdf"):
          str = "file-pdf";
          break;
        case file.endsWith(".ppt"):
          str = "file-ppt";
          break;
        default:
          str = "file";
          break;
      }
    }
    return str;
  };

  getType = (file) => {
    let filename = file;
    let index1 = filename.lastIndexOf(".");
    let index2 = filename.length;
    let type = filename.substring(index1, index2);
    return type;
  };

  changeFile = (file, fileName, type = "file") => {
    if (!!file) this.setState({ file, fileName, type });
  };

  setFile = (data, type) => {
    let str = "";
    if (!!data) {
      const file =
        typeof data === "string"
          ? data
          : (!!data.streamingUrl ? data.streamingUrl : data.url).toLowerCase();
      switch (true) {
        case file.endsWith(".mp4"):
        case file.endsWith(".m3u8"):
          str = <Video videosrc={file} light={false} />;
          // str = <VideoPlayer src={file} />;
          break;
        case file.endsWith(".jpeg") ||
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".gif"):
          str = <img src={file} alt="" />;
          break;
        case file.endsWith(".mp3"):
          str = (
            <audio
              src={file}
              autoPlay
              controls
              controlsList="nodownload"
            ></audio>
          );
          break;
        case file.endsWith(".pdf"):
          str = (
            <Document file={file} renderMode="canvas">
              <Page pageNumber={1} />
            </Document>
          );
          break;
        case type === "text":
          str = (
            <Textfit
              mode="multi"
              min={12}
              max={20}
              style={{ height: "100%", lineHeight: "200%", textAlign: "left" }}
            >
              <div dangerouslySetInnerHTML={{ __html: data }} />
            </Textfit>
          );
          break;
        default:
          str = (
            <div>
              <Icon type="file" className={styles.icon} />
              <p>{this.getType(file)}</p>
            </div>
          );
          break;
      }
    }
    return str;
  };

  render() {
    let { uploading, fileList, file, fileName, type } = this.state;
    let { data, fileData, comment } = this.props;

    //上传选择框
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">
          {this._fn("course_1.UploadingFile.tip")}
        </div>
      </div>
    );

    const thi = this;
    //<Upload/>属性
    const props = {
      listType: "picture-card",
      accept: ".gif, .jpg, .jpeg, .png, .mp4, .mov, .pdf",
      className: "avatar-uploader",
      onPreview: (file) => {
        this.handlePreview(file);
      },
      onChange: ({ fileList, file }) => {
        // 视频缩略图
        if (file.type === "video/mp4") {
          this.getVideoImage(file, function (a) {
            thi.setState({ videoImage: a });
            fileList[0].thumbUrl = thi.state.videoImage;
            thi.setState({ fileList });
          });
          return;
        }
        //图片缩略图
        this.setState({ fileList });
        if (fileList.length) this.getBase64(file);
      },
      onRemove: (file) => {
        this.setState((state) => {
          return {
            fileList: [],
          };
        });
      },
      beforeUpload: (file) => {
        this.setState((state) => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div className={styles.wrap}>
        {!this.props.data && !this.state.visible ? (
          <div
            style={{ textAlign: "center", width: "100%", padding: "150px 0" }}
          >
            <Spin />
          </div>
        ) : (
          <Row style={{ borderRadius: 30, overflow: "hidden", padding: 20 }}>
            <Col sm={12} xs={24} style={{ marginBottom: 20 }}>
              <div className={styles.container}>
                <h1>{data.name}</h1>
                <Col
                  className={styles.fileWrap}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.returnValue = false;
                  }}
                >
                  {this.setFile(file, type)}
                  <p className={styles.fileName} title={fileName}>
                    {fileName}
                  </p>
                </Col>
                {data.is_download === "N"
                  ? ""
                  : this.state.type !== "text" &&
                    !!this.state.file && (
                      <a href={file.url} alt="download">
                        <Button type="primary">
                          <Icon type="download" />
                          {this._fn(`general.button.download`)}
                        </Button>
                      </a>
                    )}
              </div>
            </Col>
            <Col sm={12} xs={24}>
              <div className={styles.container}>
                <Col
                  lg={{ span: 16, offset: 4 }}
                  sm={{ span: 20, offset: 2 }}
                  style={{ marginBottom: 20 }}
                >
                  <Row gutter={5} type="flex">
                    {data.teaching_point && (
                      <Col span={8}>
                        <div
                          className={styles.iconWrap}
                          onClick={() =>
                            this.changeFile(data.teaching_point, "", "text")
                          }
                        >
                          <Icon type="font-size" className={styles.text} />
                        </div>
                      </Col>
                    )}
                    {(data.item || []).map(
                      (item) =>
                        !!item.file && (
                          <Col span={8} key={item.id}>
                            <div
                              className={styles.iconWrap}
                              onClick={() =>
                                this.changeFile(
                                  {
                                    streamingUrl: item.streaming_url,
                                    url: item.file,
                                  },
                                  item.file_name
                                )
                              }
                            >
                              {!!item.streaming_url && (
                                <div className={styles.streaming}>
                                  <Tooltip title={this._fn(`course_1.content.PopupAECoursware.streaming_tootip`)}>
                                    <Icon type="safety-certificate" theme="twoTone" />
                                  </Tooltip>
                                </div>
                              )}
                              <div className={styles.file}>
                                <Icon
                                  type={this.setIcon(item)}
                                  className={styles.icon}
                                />
                                {this.setIcon(item) === "file" && (
                                  <p>{this.getType(item.file)}</p>
                                )}
                              </div>
                            </div>
                            <p
                              className={styles.fileName}
                              title={item.file_name}
                            >
                              {item.file_name}
                            </p>
                          </Col>
                        )
                    )}
                  </Row>
                </Col>
                {data.type === "project" &&
                  this.props.urlId &&
                  !comment.length && (
                    <>
                      <Col span={16} offset={4}>
                        <Upload {...props} beforeUpload={this.getUploadPermit}>
                          {fileList.length >= 1 ? null : uploadButton}
                        </Upload>
                        <Modal
                          visible={this.state.previewVisible}
                          footer={null}
                          onCancel={this.handleCancel}
                          zIndex={9999}
                        >
                          {this.state.modaliImg ? (
                            <img
                              alt="example"
                              style={{ width: "100%" }}
                              src={this.state.previewImage}
                            />
                          ) : (
                            <video
                              alt="example"
                              style={{ width: "100%" }}
                              src={this.state.previewImage}
                              controls
                              controlsList="nodownload"
                            />
                          )}
                        </Modal>
                      </Col>
                      {/* <Button className={styles.xs_share} onClick={e => this._share()}>
                    分享
                  </Button> */}
                      <Button
                        className={styles.xs_update}
                        onClick={(e) => this.handleUpload()}
                        disabled={
                          fileList.length === 0 || this.state.submitDisabled
                        }
                        htmlType="submit"
                        loading={uploading}
                      >
                        {this._fn("general.button.upload")}
                      </Button>

                      {!!fileData && !!fileData.fileList && (
                        <FilePreview
                          file={fileData.fileList[0].url}
                          display="block"
                        >
                          <p
                            style={{
                              color: "red",
                              lineHeight: "40px",
                              cursor: "pointer",
                            }}
                          >
                            已上載檔案
                          </p>
                        </FilePreview>
                      )}
                      <span style={{ display: "inline-block", fontSize: 14 }}>
                        * {this._fn("general.msg.upload_type2")}
                      </span>
                    </>
                  )}
              </div>
            </Col>
            {!!comment && !!comment.length && (
              <Col xs={24}>
                <CommentList
                  data={comment}
                  listItemStyle={{ borderTop: "1px solid #ddd" }}
                />
              </Col>
            )}
          </Row>
        )}
        {/* 分享 */}
        {/* <Button className={styles.share} onClick={e => this._share()}>
          <img src={require("assets/image/exploration1.png")} alt="" />
        </Button> */}
        {/* 上载 */}
        {/* <Button
          className={styles.update}
          disabled={fileList.length === 0}
          htmlType="submit"
          onClick={e => this.handleUpload()}
          // loading={uploading}
        >
          {uploading ? (
            <img src={require("assets/image/exploration21.png")} alt="" />
          ) : (
            <img src={require("assets/image/exploration2.png")} alt="" />
          )}
        </Button> */}
        {/* 关闭 */}
        <Button
          className={styles.close}
          style={{ zIndex: 9 }}
          onClick={this.onCancel}
        >
          <Icon type="close" />
        </Button>
      </div>
    );
  }
}

function mapStateToProps({ translations }) {
  return { translations };
}

export default connect(mapStateToProps)(Exploration);
