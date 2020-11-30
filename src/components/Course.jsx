import React, { Component } from "react";
import { Row, Col, Icon, Modal, message } from "antd";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import intl from "react-intl-universal";

// import InfiniteScroll from "react-infinite-scroller";

import Banner from "components/common/Banner";
import TitleTip from "components/common/TitleTip";
import Video from "components/common/Video";
//import ShooLogo from "components/common/SchooLogo";
import DraggerImgUploading from "components/common/UploadingFile";

import memu from "assets/css/memulist.module.scss";

import course from "components/services/courseService";
// import school from 'components/services/school';

import EVICourse from "components/course/CourseTemplate";
import CourseList from "components/course/CourseList";

// import QueueAnim from 'rc-queue-anim';

/**
 * 生活知識页面
 *
 * @export 生活知識页面
 * @class Knowledge
 * @extends {Component}
 */

class Knowledge extends Component {
  $$isMount = false;

  $$course = {
    current: {
      isLoading: () => true,
    },
  };

  state = {
    course: {
      id: null,
      banner: null,
      logo: null,
      name: null,
      video: null,
      school_id: null,
    }, //banner数据
    listData: [], //list 数据
    URLid: "", //url参数id
    skeleton: false, //骨架屏状态
    visible: false, //对话框状态
    updateItem: [], //編輯課程的item
    updateData: {}, //编辑页面数据
    formData: {}, //课程资料页面传过来的表单数据
    sortData: {}, //排序页面数据
    activeKey: "a", //tab的key
    disabled: true, //tab是否禁用
    uploadingFile: false, // 上传图片/影片的弹框 默认关闭
    uploadingFileType: "",
    treeData: [], //treeSelect 数据,
    selectList: [],

    staffPermit: {
      get_list: false,
      get: false,
      update: false,
      add: false,
      delete: false,
    },

    isPlay: false,
    $$loading: false,
    cousreID: null,
    offset: 0,
    limit: 50,
    result: [],
    total: 0,

    changed: 0,
  };

  constructor(props) {
    super(props);
    this.$$course = React.createRef();
    // console.log(props);
  }

  componentDidMount = async () => {
    this.$$isMount = true;
    if (!this.$$isMount) {
      return;
    }
    this.props.updateFileName("home");
  };

  componentWillUnmount = async () => {
    this.$$isMount = false;
  };

  isLoading = () => {
    return !!this.$$course.current ? this.$$course.current.isLoading() : true;
  };

  showModal = () => {
    if (!!this.$$isMount) {
      this.setState({
        visible: true,
      });
    }
  };

  setUploadingFile = (uploadingFile, uploadingFileType) => {
    if (!!this.$$isMount) {
      this.setState({ uploadingFile, uploadingFileType });
    }
  };

  //上傳成功
  uploadingDone = () => {
    this.setUploadingFile(false);
    this.getData();
  };

  createModal = (title = "") => {
    return (
      <Modal
        title={title}
        centered
        bodyStyle={{ backgroundColor: "#fff" }}
        visible={this.state.uploadingFile}
        onCancel={() => this.setUploadingFile(false)}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
      >
        <DraggerImgUploading
          aspectRatio={33 / 8}
          URLid={this.state.course.id}
          type={this.state.uploadingFileType}
          onCancel={() => this.uploadingDone()}
        />
      </Modal>
    );
  };

  ShowUploading = (type = []) => {
    this.setUploadingFile(true, type);
  };

  getData = async () => {
    return this.$$course.current.getCourse();
  };

  //memu编辑
  async handleMemuSet(item, e) {
    e.preventDefault();
    await course
      .get(item.ref_id)
      .then((ret) => {
        if (!!this.$$isMount) {
          this.setState({ updateData: ret, updateItem: ret.item });
        }
      })
      .catch((_msg) => {
        console.log(_msg);
      });
    if (!!this.$$isMount) {
      this.setState({
        visible: true,
      });
    }
  }
  // camera编辑
  handleCamera = async (item, e) => {
    e.preventDefault();
    this.ShowUploading("file");

    if (!!this.$$isMount) {
      this.setState({
        URLid: item.ref_id,
        type: "file",
      });
    }
  };
  //删除影片
  _delete = async (type, e) => {
    e.preventDefault();
    const { translations } = this.props;
    if (!!this.$$isMount) {
      let confirmLoading = false;
      Modal.confirm({
        title:
          translations.initDone && intl.get(`course_1.content.delete.${type}`),
        icon: <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />,
        content:
          translations.initDone && intl.get(`course_1.content.confirm.${type}`),
        confirmLoading: confirmLoading,
        onOk: (e) => {
          confirmLoading = true;
          return course
            .resetFile(this.state.course.id, type)
            .catch((_err) => {
              console.log(_err);
              message.error(_err.msg);
              return null;
            })
            .then((ret) => {
              confirmLoading = false;
              if (!!ret) {
                message.success("刪除成功");
                this.getData();
              }
              return true;
            });
        },
        okText: translations.initDone && intl.get(`general.button.confirm`),
        cancelText: translations.initDone && intl.get(`general.button.cancel`),
      });
    }
  };

  render() {
    const locale = {
      lang: [
        {
          name: "繁體中文",
          value: "zh",
          url: "zh-hk",
        },
        {
          name: "English",
          value: "english",
          url: "en",
        },
        {
          name: "简体中文",
          value: "cn",
          url: "zh-cn",
        },
      ],
    };
    const { translations } = this.props;
    const { course } = this.state;
    const permitUpdate = this.state.staffPermit.update;
    return (
      <EVICourse
        id="EVI-Course"
        style={{ position: "relative" }}
        staffPermitCallback={(permit) => {
          if (this.$$isMount) this.setState({ staffPermit: permit });
        }}
        getInfo={(info) => {
          if (this.$$isMount) this.setState({ course: info });
        }}
        getList={({ total, rows }) => {
          if (this.$$isMount) this.setState({ total, rows });
        }}
        getSectionList={(list) => {
          if (this.$$isMount) this.setState({ listData: list });
        }}
        courseID={this.props.match.params.course_id}
        ref={this.$$course}
        changed={this.state.changed}
      >
        <Banner
          img={this.state.course.banner}
          height="50vh"
          className={`${memu.bannerwarp} ${memu.bannermain}`}
          type="flex"
          justify="center"
          align="middle"
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#000000a6",
            }}
          />
          <React.Fragment>
            <Col
              xs={{ span: 23 }}
              md={{ span: 22 }}
              lg={{ span: 20 }}
              style={{ maxWidth: "1200px", height: "100%", display: "flex" }}
            >
              <Col xs={24} className={memu.left}>
                <Row
                  type="flex"
                  align="middle"
                  justify={!this.state.course.logo ? "space-between" : "start"}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Col
                    xs={{ span: 24 }}
                    md={{ span: 14 }}
                    style={{ position: "relative", height: "100%" }}
                  >
                    <TitleTip
                      manage={permitUpdate}
                      URLid={this.state.course.id}
                      updateData={() => this.getData()}
                      name={course.name}
                      description={course.description}
                      langInfo={course.lang_info}
                      schoolId={course.school_id}
                      color={"white"}
                    />
                  </Col>
                  {!!this.state.course.video || !!permitUpdate ? (
                    <Col
                      xs={{ span: 0 }}
                      md={{ span: 9, offset: 1 }}
                      className={memu.video_container}
                      style={{ position: "relative", height: "100%" }}
                    >
                      <Video
                        // title={
                        //   (translations.initDone &&
                        //     intl.get("course_1.content.videoTitle")) ||
                        //   "課程影片介紹"
                        // }
                        videosrc={this.state.course.video}
                        playing={this.state.isPlay}
                      >
                        {permitUpdate && (
                          <div className={memu.videoBtn_container}>
                            <div
                              className={`${memu.video_button} ${
                                !this.state.course.video ? "d-block" : ""
                              }`}
                              onClick={() => this.ShowUploading("video")}
                            >
                              {translations.initDone &&
                                intl.get("course_1.content.edit.video")}
                            </div>
                            {course.is_video === "Y" && (
                              <div
                                className={`${memu.video_button} ${
                                  !course.video ? "d-block" : ""
                                }`}
                                onClick={this._delete.bind(this, "video")}
                              >
                                {translations.initDone &&
                                  intl.get("course_1.content.delete.video")}
                              </div>
                            )}
                          </div>
                        )}
                      </Video>
                    </Col>
                  ) : (
                    ""
                  )}
                </Row>
              </Col>
            </Col>
            <React.Fragment>
              {this.createModal(
                translations.initDone && intl.get("course_1.content.ModalTitle")
              )}
              {permitUpdate && (
                <div className={`${memu.bannerBtn_container}`}>
                  <div
                    className={`${memu.banner_button}`}
                    onClick={() => this.ShowUploading("banner")}
                  >
                    <Icon type="camera" />
                    &nbsp;&nbsp;
                    {translations.initDone &&
                      intl.get("course_1.content.edit.banner")}
                  </div>
                  {course.is_banner === "Y" && (
                    <div
                      className={`${memu.banner_button}`}
                      onClick={this._delete.bind(this, "banner")}
                    >
                      <Icon type="delete" />
                      &nbsp;&nbsp;
                      {translations.initDone &&
                        intl.get("course_1.content.delete.banner")}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          </React.Fragment>
        </Banner>
        <CourseList
          sectionList={this.state.listData}
          styles="item"
          page="course"
          EVICourse={this.$$course}
          dashboard
          courseID={this.props.match.params.course_id}
          setChange={() => this.setState({ changed: this.state.changed + 1 })}
        />
      </EVICourse>
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
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: (payload) => dispatch({ type: "updateFileName", payload }),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Knowledge));
