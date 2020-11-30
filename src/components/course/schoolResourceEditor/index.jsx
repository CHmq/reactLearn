import React, { Component } from "react";
import moment from "moment";
import {
  Form,
  Input,
  Button,
  Icon,
  message,
  Select,
  DatePicker,
  Radio,
  Tabs,
  Modal,
  Spin,
  Row,
  Col,
  Tooltip,
} from "antd";
import { connect } from "react-redux";
import { Document, Page, pdfjs } from "react-pdf";
import intl from "react-intl-universal";
import styleCss from "assets/css/PopupAddCoursware.module.scss";
import ManagePopup from "components/common/ManagePopup";
import Video from "components/common/Video";
// import VideoPlayer from "components/common/VideoPlayer";
// import CheckPsw from "components/course/CheckPsw"; 刪除課件的密碼驗證
import main from "components/services/mainService";
import UploadingFile from "components/common/UploadingFile";
import school from "components/services/school";
import mainService from "components/services/mainService";
import staff from "components/services/staffService";
import { Textfit } from "react-textfit";
import CourseEditPreviewImg from "../components/CourseEditPreviewImg";
import MixVideoSort from "./mixVideoSort";

let TITLE = ""; //'新加' || 'New plus'
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
class SchoolResourceEditor extends Component {
  $$mount = false;
  state = {
    ModalWidth: 600,
    resourceID: null,
    type: null,
    title: TITLE, // 标题
    visible: false, // 显示与隐藏弹框
    //Grade: [], // 年级 多选
    //GradeOPTIONS: ['PN', 'K1', 'K2', 'K3'],
    checkValue: [],
    checkvalue: [], // 选中checkOptions的value
    fileList: [], // 图片上传
    fileShow: true, // 图片上传按钮显示与隐藏 true 为显示
    IMGtype: false, // 图片上传按钮显示与隐藏 当删除图片时候给true true 为显示
    fileType: "", // 图片文件上传的格式
    children: [], // 随意输入
    value: "project", // 单选框
    startValue: null, // 開始時間
    endValue: null, // 結束時間
    editorId: null, // 编辑iD
    disabled: true, //tabs课件档案禁用
    uploadingFile: false, //新增档案弹框
    uploadingFileType: "",
    addItemID: "",
    fileItemId: "",
    tabPane: "1",
    loading: true,
    submitLoading: false,
    file: null,
    form: {
      type: "project",
      name: "",
      status: "VALID",
      file: "",
      end_time: null,
      teaching_point: "",
      tags: [], // 数组类型
    },

    // 校本資料當前選中的 item
    schoolResouceItem: {},

    // 校本资料封面 modal 触发器
    previewVisible: false,
  };

  componentDidMount() {
    this.$$mount = true;
    typeof this.props.onOpend === "function" && this.props.onOpend(this);
  }

  componentWillUnmount = () => {
    this.$$mount = false;
  };

  _onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  // 单选框
  onChange = (e) => {
    this._onChange("value", e.target.value);
  };

  //关闭对话框
  onCancel = () => {
    this.setState({
      visible: false,
      disabled: true,
      startValue: null,
      endValue: null,
      tabPane: "1",
      fileList: [],
      loading: true,
      submitLoading: false,
      ModalWidth: 600,
      file: null,
      type: "",
      addDone: false,
      infoId: null,
      item: null,
    });
    this.Re();
  };

  // 打开对话框 (value是编辑传过来的数据)
  onOpend = (course, title = TITLE, type, ref_id = null, flag) => {
    let id = ref_id ? ref_id : !!course ? course.id : null;
   
    if (!!id) {
      this.getValue(id);
      this.setState({
        infoId: id,
        addItemID: course.res_id,
        schoolID: course.school_id,
      });
    }
    if (flag) {
      this.setState({ schoolResouceItem: course });

      this.setState({ previewVisible: true });
      return;
    }
    if (!!this.$$mount) {
      this.setState({
        visible: true,
        title: title,
        editorId: id,
      });
    }
    if (type !== "update") this.setState({ loading: false });
  };
  // 请求获取编辑详细内容
  getValue = async (id) => {
    return main
      .getFullInfo(id)
      .then(this.result)
      .catch((err) => {
        console.log(err);
      });
  };

  result = (value) => {
    let type = false;
    ["audio", "worksheet", "img_real", "document", "video", "download"].forEach(
      (item) => {
        if (value.type === item) type = true;
      }
    );
    let [newItem] = value.item.filter(item => !!item.file && item.item_type !== 'adapter');
    value.file === null
      ? this.setState({
          fileShow: true,
        })
      : this.setState({
          fileShow: false,
        });

    const { setFieldsValue } = this.props.form;
    this.setState(
      {
        form: {
          type: type ? "resource" : value.type,
          name: value.name,
          status: "VALID",
          teaching_point: value.teaching_point,
          tags: value.tags === null ? [] : value.tags, // 数组类型
          is_download: !!value.is_download ? value.is_download : "Y",
        },
        fileList: value.item,
        file: !!newItem
          ? { streamingUrl: newItem.streaming_url, url: newItem.file }
          : null,
        fileName: !!newItem ? newItem.file_name : "",
        fileId: !!newItem ? newItem.id : "",
        res_type: value.type,
        item: value.item,
        disabled: false,
        loading: false,
      },
      () => {
        setFieldsValue(this.state.form, () => {
          !!type && setFieldsValue({ resource: value.type });
        });
      }
    );
  };

  //按钮点击 提交事件
  handleSubmit = (e) => {
    this.setState({ submitLoading: true });
    let oDay = new Date();
    let time = `${oDay.getFullYear()}-${
      oDay.getMonth() + 1
    }-${oDay.getDate()} 00:00`;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!!err) {
        return;
      }
      const value = {
        name: values.name,
        file: values.file
          ? values.file.length === 0
            ? ""
            : values.file["0"].thumbUrl.split(
                `data:${this.state.fileType};base64,`
              )[1]
          : "",
        status: "VALID",
        tags: values.tags ? values.tags.join() : "",
        grade: ["PN", "K1", "K2", "K3"],
        publish_time: time,
        end_time: values.end_time
          ? values.end_time.format("YYYY-MM-DD HH:mm")
          : "",
        type: values.type === "resource" ? values.resource : values.type,
        teaching_point: values.teaching_point,
        is_download: values.is_download,
      };
      // 信息正確填寫處理
      if (!this.state.editorId && !this.state.addDone) {
        this._add(value); // 请求添加数据 api
      } else {
        this._editor(value); // 编辑数据 api
      }
    });
  };

  // 添加事件
  _add = async (values) => {
    return main
      .add(values)
      .then(ret => {
        message.success("添加成功");
        this.setState({
          getFullInfoID: ret.id,
          editorId: ret.id,
          addItemID: ret.ref_id,
          disabled: false,
          tabPane: this.props.form.getFieldValue("type") === "mix" ? "3" : "2",
          submitLoading: false,
          ModalWidth: 800,
          addDone: true,
        });
        if (typeof this.props.addCallback !== "function") {
          this.onCancel(); // 关闭弹框
        }
        main.get(ret.id).then((res) => {
          this.props.addCallback(res);
        });
      })
      .catch((_msg) => {
        message.error("error");
        console.log(_msg);
      });
  };

  // 编辑事件
  _editor = async (value) => {
    value.id = this.state.editorId;
    return main
      .update(value)
      .then((ret) => {
        message.success(
          this.props.translations.initDone &&
            intl.get(`general.msg.update_success`)
        );
        this.state.addDone && this.setState({ 
          tabPane: this.props.form.getFieldValue("type") === "mix" ? "3" : "2",
          ModalWidth: 800 
        });
        if (typeof this.props.updateCallback === "function") {
          main.get(value.id).then((res) => {
            this.props.updateCallback(res);
            this.onCancel();
          });
        }
      })
      .catch((_msg) => {
        message.error("error");
        console.log(_msg);
      })
      .then((_ret) => {
        this.setState({ submitLoading: false });
      });
  };

  // 提交驗證
  vaIidate = () => {
    const { getFieldsError, getFieldsValue } = this.props.form;
    const value = getFieldsValue([
      "type",
      "status",
      "name",
      "Upload",
      "end_time",
      "teaching_point",
      "tags",
      "is_download",
    ]);
    const error = getFieldsError([
      "type",
      "status",
      "name",
      "Upload",
      "end_time",
      "teaching_point",
      "tags",
      "is_download",
    ]);
    return error.type || error.name || !value.type || !value.name
      ? true
      : false;
  };

  // 图片上傳 or 删除都会触发
  normFile = (e) => {
    let type = e.file.type;
    // 图片上传格式
    if (
      type === "image/png" ||
      type === "image/jpeg" ||
      type === "image/gif" ||
      this.state.IMGtype === true
    ) {
      if (this.state.fileShow === true) {
        this.setState({
          fileType: e.fileList.length === 0 ? "" : e.fileList["0"].type,
          IMGtype: false,
        });
        console.log("图片上传");
      }
    } else {
      this.setState({
        fileList: "",
        fileShow: true,
      });
      message.error("你的上傳文件格式不符合!");
      return false;
    }
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };
  // 多选下拉
  // GradehandleChange = Grade => {
  //     this.setState({Grade}, ()=>{
  //         console.log(Grade);
  //     });
  // }
  // 日期 选择（发布日期、结束日期 start）
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return startValue && startValue < moment().startOf("day");
    }
    return (
      startValue.valueOf() > endValue.valueOf() ||
      startValue < moment().startOf("day")
    );
  };
  onStartChange = (current) => {
    this._onChange("startValue", current);
  };

  onEndChange = (current) => {
    this._onChange("endValue", current);
  };
  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return endValue && endValue < moment().startOf("day");
    }
    return (
      endValue.valueOf() <= startValue.valueOf() ||
      endValue < moment().startOf("day")
    );
  };
  // 日期 选择（发布日期、结束日期 end）
  // 重置表单(清空)
  Re = (e) => {
    this.setState(
      {
        fileShow: true,
        // IMGtype:true
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  createModal = () => {
    const {
      translations,
      translations: { initDone },
    } = this.props;
    return (
      <Modal
        title={translations.initDone && intl.get("course_1.content.fileTitle")}
        centered
        bodyStyle={{ backgroundColor: "#fff" }}
        visible={this.state.uploadingFile}
        onCancel={() => this.setState({ uploadingFile: false })}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
        zIndex={9999}
      >
        <UploadingFile
          tip={initDone && intl.get("course_1.UploadingFile.fileTip")}
          URLid={
            this.state.uploadingFileType === "courseFile_add"
              ? this.state.addItemID
              : this.state.fileItemId
          }
          type={this.state.uploadingFileType}
          onCancel={() => {
            this.getValue(
              !this.state.infoId ? this.state.getFullInfoID : this.state.infoId
            );
            this.setState({ uploadingFile: false });
          }}
        />
      </Modal>
    );
  };

  openedEdit = (type, fileItemId, e) => {
    e.stopPropagation();
    this.setState({ uploadingFileType: type, uploadingFile: true });
    if (type === "courseFile_update") this.setState({ fileItemId });
  };

  getType = (file) => {
    let filename = file;
    let index1 = filename.lastIndexOf(".");
    let index2 = filename.length;
    let type = filename.substring(index1, index2);
    return type;
  };

  setIcon = (file) => {
    let str = "";
    if (!!file) {
      switch (true) {
        case file.endsWith(".mp4"):
          str = (
            <img
              src={file + "?x-oss-process=video/snapshot,t_1000,f_jpg,m_fast"}
              alt=""
            />
          );
          break;
        case this.fileTypeOf(file, [".jpeg", ".jpg", ".png", ".gif"]):
          str = <img src={file} alt="" />;
          break;
        case file.endsWith(".mp3"):
          str = <Icon type="audio" className={styleCss.fileIcon} />;
          break;
        case file.endsWith(".pdf"):
          str = <Icon type="file-pdf" className={styleCss.fileIcon} />;
          break;
        case file.endsWith(".ppt"):
          str = <Icon type="file-ppt" className={styleCss.fileIcon} />;
          break;
        default:
          str = (
            <div className={styleCss.file}>
              <Icon type="file" className={styleCss.icon} />
              <p>{this.getType(file)}</p>
            </div>
          );
          break;
      }
    } else str = <span>未有檔案</span>;
    return str;
  };
  //tabs面板切换
  tabsChange = (key) => {
    this.setState({ tabPane: key, ModalWidth: key === "1" ? 600 : 800 });
  };

  //刪除檔案 or 設置封面圖 or 刪除課件
  _ModalConfirm = async (type, id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const { translations } = this.props;
    let confirmLoading = false;
    Modal.confirm({
      zIndex: 10000,
      title:
        translations.initDone &&
        intl.get(`course_1.content.PopupAECoursware.${type}`),
      icon: <Icon type="delete" theme="twoTone" />,
      content:
        translations.initDone &&
        intl.get(`course_1.content.PopupAECoursware.${type}_tip`),
      confirmLoading: confirmLoading,
      onOk: (e) => {
        confirmLoading = true;
        return (type === "mainDelete"
          ? mainService.mainDelete(id)
          : school[type](id)
        )
          .catch((_err) => {
            console.log(_err);
            if (type === "mainDelete" && _err.result === 1401) {
              message.warning(
                translations.initDone &&
                  intl.get(`general.msg.prohibit_deletion`)
              );
              return;
            }
            message.error(
              translations.initDone && intl.get(`general.msg.failure`)
            );
            return null;
          })
          .then((ret) => {
            confirmLoading = false;
            if (!!ret) {
              message.success(
                translations.initDone && intl.get(`general.msg.success`)
              );
              type === "deleteItem" &&
                this.getValue(
                  !this.state.infoId
                    ? this.state.getFullInfoID
                    : this.state.infoId
                );
              if (type === "mainDelete") {
                this.setState({ visible: false });
                this.props.addCallback();
              }
            }
            return true;
          });
      },
      okText: translations.initDone && intl.get(`general.button.confirm`),
      cancelText: translations.initDone && intl.get(`general.button.cancel`),
    });
  };

  changeFile = (item) => {
    if (!!item.file || !!item.streaming_url) {
      this.setState({
        file: { streamingUrl: item.streaming_url, url: item.file },
        fileId: item.id,
        fileName: item.file_name,
      });
    }
  };

  fileTypeOf = (file, typeArr) => {
    return typeof file === "string"
      ? typeArr.some((item) => !!file.toLowerCase().endsWith(item))
      : false;
  };

  setFile = (data) => {
    let str = "";
    if (!!data) {
      const file = (!!data.streamingUrl
        ? data.streamingUrl
        : data.url
      ).toLowerCase();
      switch (true) {
        case this.fileTypeOf(file, [".mp4", ".m3u8"]):
          str = <Video videosrc={file} light={false} />;
          break;
        case this.fileTypeOf(file, [".jpeg", ".jpg", ".png", ".gif"]):
          str = <img src={file} alt="" />;
          break;
        case file.endsWith(".mp3"):
          str = <audio src={file} autoPlay controls></audio>;
          break;
        case file.endsWith(".pdf"):
          str = (
            <Document file={file} renderMode="canvas">
              <Page pageNumber={1} />
            </Document>
          );
          break;
        default:
          str = (
            <div>
              <Icon type="file" className={styleCss.icon} />
              <p>{this.getType(file)}</p>
            </div>
          );
          break;
      }
    }
    return str;
  };

  render() {
    const {
      title,
      file,
      fileId,
      type,
      item,
      editorId,
      schoolID,
      fileName,
      schoolResouceItem,
    } = this.state;
    const { translations } = this.props;
    // const GradeOptions = GradeOPTIONS.filter(o => !Grade.includes(o));
    // 樣式自適應
    const formItemLayout = {
      labelCol: {
        xs: { span: 22 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 22 },
        sm: { span: 15 },
      },
    };
    const { getFieldDecorator } = this.props.form;

    const _fn_ = function (value) {
      return (
        translations.initDone &&
        intl.get("home.publicMsg.resource_type." + value)
      );
    };

    const resource = [
      { value: "audio", text: _fn_("audio") },
      { value: "document", text: _fn_("document") },
      { value: "img_real", text: _fn_("img_real") },
      { value: "worksheet", text: _fn_("worksheet") },
      { value: "video", text: _fn_("video") },
      { value: "download", text: _fn_("download") },
    ];

    // 图片上传
    // const props = {
    //     listType: 'picture',
    //     accept: ".png,.jpg,.gif",
    //     onRemove: file => {
    //         this.setState(state => {
    //             const index = state.fileList.indexOf(file);
    //             const newFileList = state.fileList.slice();
    //             newFileList.splice(index, 1);
    //             return {
    //                 fileList: newFileList,
    //                 IMGtype: true
    //             };
    //         });
    //     },
    //     onChange: file => {
    //         // 监听图片上传按钮显示与隐藏
    //         if (file.fileList.length === 0) {
    //             this.setState({
    //                 fileShow: true
    //             });
    //         } else {
    //             this.setState({
    //                 fileShow: false
    //             });
    //         }
    //     },
    //     beforeUpload: file => {
    //         this.setState(state => ({
    //                 fileList: [...state.fileList, file]
    //             }));
    //         return false;
    //     }
    //     // defaultFileList:[...fileList]
    // };
    // 多语言
    const _fn = function (value) {
      return (
        translations.initDone &&
        intl.get("course_1.content.PopupAECoursware." + value)
      );
    };
    const Language = {
      File: _fn("File"),
      FileSupport: _fn("FileSupport"),
      Type: _fn("Type"),
      State: _fn("State"),
      Name: _fn("Name"),
      Resource: _fn("Resource"),
      Coverimg: _fn("Coverimg"),
      Coverimgbtn: _fn("Coverimgbtn"),
      CoverimgSupport: _fn("CoverimgSupport"),
      // Grade: _fn("Grade"),
      Releasetime: _fn("Releasetime"),
      Endtime: _fn("Endtime"),
      Teachingfocus: _fn("Teachingfocus"),
      IsDownload: _fn("IsDownload"),
      DownloadYes: _fn("DownloadYes"),
      DownloadNo: _fn("DownloadNo"),
      Keywords: _fn("Keywords"),
      TITLE: _fn("TITLE"),
      btnadd: _fn("btnadd"),
      btnsure: _fn("btnsure"),
      Radiodocument: _fn("Radiodocument"),
      Radioproject: _fn("Radioproject"),
      RadioResource: _fn("RadioResource"),
      SelectEffective: _fn("SelectEffective"),
      SelectInvalid: _fn("SelectInvalid"),
      rulesType: _fn("rulesType"),
      rulesStatus: _fn("rulesStatus"),
      rulesName: _fn("rulesName"),
      rulesGrade: _fn("rulesGrade"),
      rulesReleasetime: _fn("rulesReleasetime"),
      information: _fn("information"),
      file: _fn("file"),
      mix: _fn("mix")
    };
    TITLE = Language.TITLE;

    const {
      type: btnType,
      shape: btnShape,
      icon: btnIcon,
      text: btnText,
    } = this.props;

    return (
      <React.Fragment>
        {this.props.btnShow && (
          <Button
            type={btnType || "primary"}
            shape={btnShape || "circle"}
            icon={btnIcon || "plus"}
            onClick={this.onOpend}
          >
            {btnShape !== "circle" ? btnText : ""}
          </Button>
        )}
        <ManagePopup
          maskClosable={false}
          zIndex={400}
          title={title}
          width={this.state.ModalWidth}
          onCancel={this.onCancel}
          visible={this.state.visible}
        >
          {!!item &&
            item.length === 0 &&
            staff.checkRPermit({
              module: "resource",
              ctrl: "main",
              action: "delete",
            }) &&
            staff.checkMerchant(schoolID) && (
              <Button
                onClick={this._ModalConfirm.bind(this, "mainDelete", editorId)}
                type="danger"
                size="small"
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  zIndex: 10,
                }}
              >
                {this.props.translations.initDone &&
                  intl.get(`course_1.content.deletebtn`)}
              </Button>
              // 刪除課件的密碼驗證
              // <div style={{position: 'absolute', top: '10px', right: '10px', zIndex: 10}}>
              //     <CheckPsw editorId={editorId} updateCallback={()=>{
              //         this.setState({visible: false});
              //         this.props.addCallback();
              //     }}/>
              // </div>
            )}
          <Tabs
            activeKey={this.state.tabPane}
            onChange={this.tabsChange}
            style={{ background: "#fff" }}
          >
            <Tabs.TabPane
              tab={Language.information}
              key="1"
              style={{ padding: 10 }}
            >
              <Spin spinning={this.state.loading}>
                <Form
                  {...formItemLayout}
                  onSubmit={this.handleSubmit}
                  className={`login-form ${styleCss.warp}`}
                >
                  <Form.Item label={Language.Type}>
                    {getFieldDecorator("type", {
                      rules: [
                        { required: true, message: `${Language.rulesType}` },
                      ],
                      initialValue: "project",
                    })(
                      <Radio.Group onChange={() => this.onChange}>
                        {false && (
                          <Radio value={"document"}>
                            {Language.Radiodocument}
                          </Radio>
                        )}
                        <Tooltip title="主要用作學生遞交及學校可以批閱功課或作品分享">
                          <Radio value={"project"}>
                            {Language.Radioproject}
                          </Radio>
                        </Tooltip>
                        <Tooltip title="主要用作學校上傳校本的教套資源包括影片、工作紙、聲音檔等等">
                          <Radio value={"resource"}>
                            {Language.RadioResource}
                          </Radio>
                        </Tooltip>
                        <Radio value={"mix"}>
                          {Language.mix}
                        </Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                  {this.props.form.getFieldValue("type") === "resource" && (
                    <Form.Item label={Language.Resource}>
                      {getFieldDecorator("resource", {
                        rules: [{ required: true }],
                        initialValue: "audio",
                      })(
                        <Select>
                          {resource.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.text}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  )}
                  <Form.Item label={Language.Name}>
                    {getFieldDecorator("name", {
                      rules: [
                        { required: true, message: `${Language.rulesName}` },
                      ],
                    })(<Input placeholder="" />)}
                  </Form.Item>
                  {/* <Form.Item label={Language.Grade}>
                                        {getFieldDecorator('grade', {rules: [{required: true,message: `${Language.rulesGrade}`}]
                                        })(
                                            <Select
                                                mode="multiple"
                                                placeholder=""
                                                onChange={this.GradehandleChange}
                                                style={{width: '100%'}}
                                                >
                                                {GradeOptions.map(item => (
                                                    <Select.Option key={item} value={item}>
                                                        {item}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        )}
                                    </Form.Item> */}
                  {/* <Form.Item label={Language.Releasetime}>
                                        {getFieldDecorator('publish_time', {rules: [{required: true, message: `${Language.rulesReleasetime}`}]
                                    })(
                                        <DatePicker
                                        disabledDate={this.disabledStartDate}
                                        style={{width: '100%'}}
                                        placeholder=""
                                        format="YYYY-MM-DD HH:mm"
                                        onChange={this.onStartChange}
                                        />
                                    )}
                                    </Form.Item> */}
                  {false && (
                    <Form.Item label={Language.Endtime}>
                      {getFieldDecorator("end_time")(
                        <DatePicker
                          format="YYYY-MM-DD HH:mm"
                          style={{ width: "100%" }}
                          placeholder={""}
                          onChange={this.onEndChange}
                          disabledDate={this.disabledEndDate}
                        ></DatePicker>
                      )}
                    </Form.Item>
                  )}
                  <Form.Item label={Language.Teachingfocus}>
                    {getFieldDecorator("teaching_point")(
                      <Input placeholder="" />
                    )}
                  </Form.Item>
                  <Form.Item label={Language.Keywords}>
                    {getFieldDecorator("tags")(
                      <Select
                        mode="tags"
                        style={{ width: "100%" }}
                        placeholder={""}
                        tokenSeparators={[","]}
                      >
                        {this.state.children}
                      </Select>
                    )}
                  </Form.Item>
                  {this.props.form.getFieldValue("type") !== "mix" && (
                    <Form.Item label={Language.IsDownload}>
                      {getFieldDecorator("is_download")(
                        <Radio.Group>
                          <Radio value={"Y"}>{Language.DownloadYes}</Radio>
                          <Radio value={"N"}>{Language.DownloadNo}</Radio>
                        </Radio.Group>
                      )}
                    </Form.Item>
                  )}
                  <div>
                    <Button
                      type="primary"
                      style={{ width: "100%" }}
                      htmlType="submit"
                      disabled={this.vaIidate()}
                      loading={this.state.submitLoading}
                    >
                      {this.state.title === TITLE
                        ? Language.btnadd
                        : Language.btnsure}
                    </Button>
                  </div>
                </Form>
              </Spin>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={Language.file}
              key="2"
              disabled={this.state.disabled}
              className={styleCss.fileWarp}
            >
              <Row gutter={20}>
                {!!file && (
                  <Col md={12} xs={24} className={styleCss.previewContainer}>
                    <div className={styleCss.preview}>
                      {this.setFile(file, type)}
                    </div>
                    <Textfit mode="single" min={12} max={20}>
                      <p className={styleCss.fileName} title={fileName}>
                        {fileName}
                      </p>
                    </Textfit>
                    {this.fileTypeOf(file.url, [
                      ".jpeg",
                      ".jpg",
                      ".png",
                      ".gif",
                    ]) && (
                      <Button
                        onClick={this._ModalConfirm.bind(
                          this,
                          "setCover",
                          fileId
                        )}
                        type="primary"
                        style={{ marginRight: 10 }}
                      >
                        <Icon type="camera" />{" "}
                        {translations.initDone &&
                          intl.get(`general.button.setCover`)}
                      </Button>
                    )}
                    <a href={file.url} alt="download">
                      <Button type="primary">
                        <Icon type="download" />{" "}
                        {translations.initDone &&
                          intl.get(`general.button.download`)}
                      </Button>
                    </a>
                  </Col>
                )}
                <Col md={12} xs={24}>
                  <Row gutter={10} type="flex">
                    {(this.state.fileList || []).map((item) => {
                      return item.item_type !== 'adapter' ? (
                        <Col
                          span={12}
                          key={item.type + item.id}
                          onClick={() => this.changeFile(item)}
                        >
                          <div className={styleCss.fileItem}>
                            {this.setIcon(item.file)}
                            {!!item.streaming_url && (
                              <div className={styleCss.streaming}>
                                <Tooltip title={translations.initDone && intl.get(`course_1.content.PopupAECoursware.streaming_tootip`)}>
                                  <Icon type="safety-certificate" theme="twoTone" />
                                </Tooltip>
                              </div>
                            )}
                            <div className={styleCss.action}>
                              <Icon
                                type="edit"
                                onClick={this.openedEdit.bind(
                                  this,
                                  "courseFile_update",
                                  item.id
                                )}
                                className={styleCss.edit}
                              />
                              <br />
                              <Icon
                                type="delete"
                                onClick={this._ModalConfirm.bind(
                                  this,
                                  "deleteItem",
                                  item.id
                                )}
                                className={styleCss.delete}
                              />
                            </div>
                          </div>
                          <Textfit mode="single" min={12} max={20}>
                            <p
                              className={styleCss.fileName}
                              title={item.file_name}
                            >
                              {item.file_name}
                            </p>
                          </Textfit>
                        </Col>
                      ) : ''
                    })}
                    <Col span={6}>
                      <Button
                        type="primary"
                        onClick={this.openedEdit.bind(
                          this,
                          "courseFile_add",
                          ""
                        )}
                        className={styleCss.fileBtn}
                      >
                        <Icon type="plus" style={{ fontSize: 25 }} />
                      </Button>
                    </Col>
                  </Row>
                  {this.createModal()}
                </Col>
                <Col xs={24} style={{textAlign: 'center'}}>
                  <Button type="primary" onClick={this.onCancel}>
                    {translations.initDone && intl.get(`general.button.done`)}
                  </Button>
                </Col>
              </Row>
            </Tabs.TabPane>
            {(this.state.res_type === 'mix' || !this.state.infoId) && (
              <Tabs.TabPane
                tab={Language.mix}
                key="3"
                disabled={this.state.disabled}
                className={styleCss.fileWarp}
              >
                {this.state.tabPane === '3' && (
                  <MixVideoSort
                    id={this.state.editorId}
                    URLid={this.state.addItemID}
                    list={this.state.fileList.filter(_ => _.item_type === 'adapter')}
                    onDeleteItem={this._ModalConfirm}
                    onRefresh={this.getValue}
                    onClose={this.onCancel}
                  />
                )}
              </Tabs.TabPane>
            )}
          </Tabs>
        </ManagePopup>
        {/* 校本资料上传封面 组件 */}
        <CourseEditPreviewImg
          visible={this.state.previewVisible}
          setVisible={() => this.setState({ previewVisible: false })}
          item={schoolResouceItem}
          updateCallback={this.props.updateCallback}
        />
      </React.Fragment>
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

export default connect(mapStateToProps)(Form.create()(SchoolResourceEditor));
