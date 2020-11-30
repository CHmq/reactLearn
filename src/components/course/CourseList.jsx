import React, { Component } from "react";
import {
  message,
  Row,
  Col,
  Button,
  Icon,
  Modal,
  TreeSelect,
  Select,
  Tooltip,
} from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { Textfit } from "react-textfit";
import moment from "moment";

import EVILoader from "components/spinner/Loader";
import InfiniteScroll from "react-infinite-scroller";
import NProgress from "nprogress";
import Adapter from "components/resource/Adapter";

import Resource from "components/course/Resource";
import DraggerImgUploading from "components/common/UploadingFile";
import SchoolResource from "components/course/schoolResourceEditor";
import LandingPopup from "components/LandingPopup";
import Explore360 from "components/Explore360";
import FilePreview from "components/resource/FilePreview";

import CourseEditor from "components/course/CourseEditor";

import memu from "assets/css/memulist.module.scss";

import school from "components/services/school";
import staff from "components/services/staffService";
import favourite from "components/services/user_favourite";

import { SUPPORT_SCHOOL } from "config/course.json";
import user from "components/services/userService";

import QueueAnim from "rc-queue-anim";

const { SHOW_PARENT } = TreeSelect;
const { Option } = Select;

const colSpan = {
  courseItem: {
    xl: 4,
    lg: 6,
    md: 8,
    xs: 12,
  },
  infoItem: {
    xl: 6,
    lg: 8,
    xs: 12,
  },
  courseSelect: {
    xl: 4,
    lg: 6,
    xs: 12,
  },
  infoSelect: {
    xl: 6,
    xs: 12,
  },
  courseTreeSelect: {
    xl: { span: 4, offset: 10 },
    lg: 6,
    xs: 12,
  },
  infoTreeSelect: {
    xl: { span: 6, offset: 4 },
    xs: 12,
  },
  courseButton: {
    xl: 3,
    md: 6,
    xs: 8,
  },
  infoButton: {
    xl: 4,
    md: 6,
    xs: 8,
  },
};

class CourseList extends Component {
  $$isMount = false;
  $$init = false;
  $$courseEditor = null;

  onRef = React.createRef();

  state = {
    staffPermit: {
      get: false,
      get_list: false,
      add: false,
      update: false,
      delete: false,
    },

    visible: false, //对话框状态
    updateItem: [], //編輯課程的item
    updateData: {}, //编辑页面数据
    formData: {}, //课程资料页面传过来的表单数据
    sortData: {}, //排序页面数据
    activeKey: "a", //tab的key
    disabled: true, //tab是否禁用
    uploadingFile: false, // 上传图片/影片的弹框 默认关闭
    updateLoading: false,

    editLoading: null,
    classTree: [],
    sectionList: [],
    isLoading: false,
    isMore: false,
    $$course: null,
    course: null,

    noBackground: false,
    targetID: null,
    bg_id: null,

    offset: 0,

    star: false,
  };

  componentDidMount = async () => {
    NProgress.configure({ parent: "#courseList", showSpinner: false });
    this.$$isMount = true;
    if (!this.$$isMount) {
      return;
    }
  };

  componentDidUpdate = async (prevProps, prevState) => {
    const { EVICourse, noBackground } = this.props;
    if (!EVICourse || !EVICourse.current) {
      return;
    }

    const _currProps = {
      sectionList: EVICourse.current.state.sectionList,
      staffPermit: EVICourse.current.state.staffPermit,
      $$course: EVICourse.current,
      course: EVICourse.current.state.course,
      noBackground: !!noBackground,
    };

    _currProps["isMore"] = EVICourse.current.isMore();
    _currProps["updateLoading"] = EVICourse.current.updateLoading();
    _currProps["isLoading"] = EVICourse.current.isLoading();

    if (
      !!this.$$init &&
      Object.keys(_currProps)
        .map((_key) => prevState[_key] === _currProps[_key])
        .filter((_compare) => _compare !== true).length === 0
    ) {
      return;
    }

    this.setState(_currProps, () => {
      if (
        !prevState.staffPermit.get_list &&
        this.state.staffPermit.get_list &&
        this.state.classTree.length === 0
      ) {
        this.getClassList();
      }
      this.$$init = true;
    });
  };

  componentWillUnmount = async () => {
    this.$$isMount = false;
  };

  lang = (value) => {
    return this.props.translations.initDone && intl.get(value);
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
    this.updateList();
    this.setUploadingFile(false);
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
          aspectRatio={4 / 3}
          bgId={this.state.bg_id}
          URLid={this.state.targetID || this.state.course.id}
          type={this.state.uploadingFileType}
          onCancel={() => this.uploadingDone()}
        />
      </Modal>
    );
  };

  ShowUploading = (type = []) => {
    this.setUploadingFile(true, type);
  };

  getData = async (i_reset = true) => {
    return this.state.$$course.getList(i_reset);
  };

  updateList = async () => {
    return this.state.$$course.updateList();
  };
  //关闭对话框
  onCancel = () => {
    if (!!this.$$isMount) {
      this.setState({
        visible: false,
        activeKey: "a",
        disabled: true,
      });
    }
  };

  // onRef = ref => {
  //   this.child = ref;
  // };

  //显示新增课程
  showAddCourse = (e) => {
    this.onRef.current.showModal();
  };

  _edit = async (item, e) => {
    e.preventDefault();
    if (!!this.state.editLoading) {
      return;
    }
    let $$call = this.state.$$course
      .getFullInfo(item.ref_id)
      .then((ret) => {
        if (!!this.$$isMount) {
          this.setState({ editLoading: null }, () => {
            this.onRef.current.showModal(ret);
          });
        }
      })
      .catch((_msg) => {
        console.log(_msg);
      });
    this.setState({ editLoading: item.ref_id });
    return $$call;
  };

  _delete = async (item, e) => {
    const { translations } = this.props;
    e.preventDefault();
    e.stopPropagation();
    if (!!this.$$isMount) {
      let confirmLoading = false;
      Modal.confirm({
        title:
          translations.initDone &&
          intl.get("course_1.content.delete.del_btn.title"),
        icon: <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />,
        content:
          translations.initDone &&
          intl.get("course_1.content.delete.del_btn.del_contant") +
            `「${item.name}」？`,
        confirmLoading: confirmLoading,
        onOk: (e) => {
          confirmLoading = true;
          return this.state.$$course
            .removeCourse(item.id)
            .catch((_err) => {
              console.log(_err);
              message.error(_err.msg);
              return null;
            })
            .then((ret) => {
              confirmLoading = false;
              if (!!ret) {
                message.success("刪除成功");
              }
              return true;
            });
        },
        okText:
          translations.initDone &&
          intl.get("course_1.content.delete.del_btn.okText"),
        cancelText:
          translations.initDone &&
          intl.get("course_1.content.delete.del_btn.cancelText"),
      });
    }
  };

  // camera编辑
  _editPreview = async (item, e) => {
    e.preventDefault();
    console.log(item);
    if (!!this.$$isMount) {
      this.setState(
        {
          targetID: item.ref_id,
          bg_id: item.bg_id,
          type: "file",
        },
        () => {
          this.ShowUploading("file");
        }
      );
    }
  };
  //获取课程资料的表单数据
  getFormData(item, data) {
    if (!!this.$$isMount) {
      this.setState({
        formData: item,
        sortData: data,
      });
    }
  }
  //下一步
  nextStep() {
    if (!!this.$$isMount) {
      this.setState({
        activeKey: "b",
        disabled: false,
      });
    }
  }
  //課程排序頁面上一步
  sortCancel() {
    if (!!this.$$isMount) {
      this.setState({
        activeKey: "a",
        disabled: true,
      });
    }
  }
  //treeSelect数据处理
  getClassList = async () => {
    const {
      route: { currentLocation },
    } = this.props;
    if (!!this.$$getClass) {
      return this.$$getClass;
    }
    this.$$getClass = school.getClassTree(currentLocation);
    let gList = await this.$$getClass;
    if (!!this.$$isMount) {
      this.setState({
        classTree: gList.classTree,
        classList: !!this.props.grade
          ? gList.classList.filter((item) =>
              this.props.grade.includes(item.grade_type)
            )
          : gList.classList,
      });
    }
  };

  onSelect = (i_select, node, extra) => {
    let _ret = (extra["allCheckedNodes"] || []).map((_select) => {
      if (!_select.pos) {
        return;
      }
      let level = _select.pos.split("-");
      if (level.length > 2) {
        return (
          (!!_select.children &&
            _select.children.map((_child) => _child.node.props.value)) ||
          _select.node.props.value
        );
      }
      return _select.node.props.value;
    });
    this.state.$$course.setFilter(
      [].concat(..._ret).map((__ret) => {
        if (!__ret) {
          return null;
        }
        let map = __ret.split("-");
        return map.length === 3
          ? `dummy-${map[0]}-${map[2]}`
          : `dummy-${__ret}`;
      })
    );
  };

  onSort = (order) => {
    const sort = !!order ? "publish_time" : "";
    this.state.$$course.setSort(sort, order);
  };

  async handleClickStar(item, index, e) {
    e.preventDefault();
    if (!!this.state.editLoading) {
      return;
    }
    let data = this.state.sectionList;
    let type = item.is_favourite === "Y" ? "starDelete" : "starAdd";
    let $$call = favourite[type](item.ref_id)
      .then((ret) => {
        data[0].data[index].is_favourite =
          data[0].data[index].is_favourite === "Y" ? "N" : "Y";
        this.setState({ sectionList: data });
        if (!!this.$$isMount) {
          this.setState({ editLoading: null });
        }
      })
      .catch((_msg) => {
        console.log(_msg);
      });
    this.setState({ editLoading: item.ref_id });
    return $$call;
  }

  onOpend = (ref) => {
    this.schoolEaitChild = ref;
  };

  childOpend = (item, title, type, ref_id, e) => {
    e.stopPropagation();
    this.schoolEaitChild.onOpend(item, title, type, ref_id);
  };

  render() {
    const { styles, translations, courseID, page } = this.props;

    const merchantID =
      user.getType() === "STAFF" ? user.staff().merchant_uid : "";
    const permitUpdate = this.state.staffPermit.update;

    if (!this.$$init) return null;

    const styleCss = {
      courseList: {
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
        minHeight: "200px",
      },
      background: {
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: `url(${
          !!this.state.course ? this.state.course.background : null
        })`,
        minHeight: "calc(100vh - 147px)",
      },
      button: {
        background: "#2b4b80",
        color: "#fff",
      },
    };

    const _fn = function (value) {
      return translations.initDone && intl.get("course_1.content." + value);
    };
    const Language = {
      set: _fn("setbtn"),
      change: _fn("changebtn"),
      delete: _fn("deletebtn"),
      report: _fn("reportbtn"),
    };

    const Loader = (
      <div className="loader" key={0} style={{ textAlign: "center" }}>
        Loading ...
      </div>
    );
    return (
      <Row
        key={"course-item-list"}
        id="courseList"
        type="flex"
        justify="space-around"
        style={{
          minHeight: "100vh",
          ...(!!this.state.noBackground ? {} : styleCss.background),
        }}
      >
        {this.createModal(this.lang("course_1.content.ModalTitle"))}
        <Col xl={24} sm={22} xs={24} style={{ maxWidth: "1200px" }}>
          <Row type="flex" gutter={20} style={{ margin: "30px 0 10px 0" }}>
            <Col {...colSpan[page + "Select"]} style={{ marginBottom: 10 }}>
              <Select
                defaultValue=""
                style={{ width: "100%" }}
                onChange={this.onSort}
              >
                <Option value="">
                  {this.lang("general.title.courseSort.sortDefault")}
                </Option>
                <Option value="ASC">
                  {this.lang("general.title.courseSort.sortASC")}
                </Option>
                <Option value="DESC">
                  {this.lang("general.title.courseSort.sortDESC")}
                </Option>
              </Select>
            </Col>
            {permitUpdate && courseID !== "school_resource" && (
              <>
                <Col
                  {...colSpan[page + "TreeSelect"]}
                  style={{ marginBottom: 10 }}
                >
                  <TreeSelect
                    treeData={this.state.classTree}
                    filterTreeNode={(_search, node) =>
                      !!node.props &&
                      !!node.props.title &&
                      node.props.title
                        .toUpperCase()
                        .indexOf(_search.toUpperCase()) > -1
                    }
                    treeCheckable={true}
                    placeholder={this.lang("course_1.content.option.grade")}
                    allowClear={true}
                    showCheckedStrategy={SHOW_PARENT}
                    showSearch={true}
                    onChange={this.onSelect}
                    style={{ width: "100%" }}
                  />
                </Col>
                <Col
                  {...colSpan[page + "Button"]}
                  style={{ textAlign: "center" }}
                >
                  <LandingPopup
                    ref="LandingPopup"
                    type={"studentedit"}
                    title={this.lang("course_1.content.option.studentEdit")}
                    width={1600}
                    className={"manageModal"}
                    style={styleCss.button}
                    item={{ name: "" }}
                    zIndex={777}
                  />
                </Col>
                <Col
                  {...colSpan[page + "Button"]}
                  style={{ textAlign: "center" }}
                >
                  <Button
                    style={styleCss.button}
                    onClick={this.showAddCourse}
                    block
                  >
                    {this.lang("course_1.content.option.calssAdd")}
                  </Button>
                </Col>
                <CourseEditor
                  forwardedRef={this.onRef}
                  URLid={this.state.course.id}
                  refresh={() => {
                    this.getData();
                  }}
                  setChange={this.props.setChange}
                />
              </>
            )}
          </Row>
          <EVILoader
            style={{ marginTop: "20rem" }}
            loading={!!this.state.isLoading}
          />
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loader={Loader}
            loadMore={() => {
              if (!!this.state.isMore && !this.state.updateLoading) {
                this.state.$$course.setOffset(
                  this.state.$$course.state.offset + 1
                );
              }
            }}
            hasMore={!!this.state.isMore}
          >
            {this.state.sectionList.map((section, index) => {
              return (
                <React.Fragment key={section.section_id || index}>
                  <Row
                    type="flex"
                    justify="space-between"
                    style={{ marginBottom: 10, marginTop: 15 }}
                  >
                    <Col xl={5}>
                      <h1
                        style={{ color: "#2b4b80", fontWeight: 600, margin: 0 }}
                      >
                        {section.section_name}
                      </h1>
                    </Col>
                  </Row>
                  <QueueAnim
                    className="ant-row-flex ant-row-flex-middle"
                    type="scale"
                    interval={60}
                    duration={600}
                    ease={["easeInOutElastic"]}
                  >
                    {section.data.map((item, index) => {
                      return (
                        !!item && (
                          <Col
                            {...colSpan[page + "Item"]}
                            className={memu[styles]}
                            key={index}
                            style={{ padding: "0 10px", marginBottom: "1rem" }}
                          >
                            <div
                              style={{
                                position: "relative",
                                borderRadius: 20,
                              }}
                            >
                              <Adapter
                                course={this.state.course}
                                item={item}
                                info={true}
                                nWindow={true}
                              >
                                <div style={{position: 'relative'}}>
                                  <Resource
                                    multi={true}
                                    index={index}
                                    picUrl={item.bg_id ? item.bg_file : item.file}
                                    title={
                                      item.type === "COURSE" &&
                                      this.state.course.school_id.toString() ===
                                        "1"
                                        ? ""
                                        : item.name
                                    }
                                    titleRadius={"0 0 20px 20px"}
                                    titlePadding={"0 0 0 20px"}
                                    borderRadius={"20px"}
                                    height={"100%"}
                                  />
                                  {item.bg_file && (
                                    <div style={{position: 'absolute', width: '100%', top: '50%', textAlign: 'center', color: '#000000bf', padding: '0.8rem', transform: 'translateY(-50%)', fontWeight: 'bold'}}>
                                      <Textfit mode="single">{item.name}</Textfit>
                                    </div>
                                  )}
                                </div>
                                {item.type === "COURSE" &&
                                  this.state.course.school_id.toString() ===
                                    "1" && (
                                    <h3
                                      style={{
                                        textAlign: "center",
                                        margin: 0,
                                        padding: 0,
                                      }}
                                    >
                                      {item.name}
                                    </h3>
                                  )}
                                {!!this.props.dashboard ? (
                                  <h4 style={{ textAlign: "center" }}>
                                    {!!item.publish_time || !!item.end_time
                                      ? `${
                                          (!!item.publish_time &&
                                            moment(item.publish_time).format(
                                              "YYYY-MM-DD"
                                            )) ||
                                          ""
                                        }${
                                          (!!item.end_time &&
                                            " ~ " +
                                              moment(item.end_time).format(
                                                "YYYY-MM-DD"
                                              )) ||
                                          "　"
                                        }`
                                      : "　"}
                                  </h4>
                                ) : (
                                  ""
                                )}
                              </Adapter>
                              {this.state.staffPermit.get_list && (
                                <div className={memu.warp}>
                                  {item.type === "COURSE" && permitUpdate && (
                                    <React.Fragment>
                                      <Tooltip
                                        placement="right"
                                        title={Language.set}
                                      >
                                        <div
                                          className={`${memu.set} ${memu.btn}`}
                                          onClick={this._edit.bind(this, item)}
                                        >
                                          <Icon
                                            type={
                                              !!this.state.editLoading &&
                                              this.state.editLoading ===
                                                item.ref_id
                                                ? "loading"
                                                : "setting"
                                            }
                                          />
                                        </div>
                                      </Tooltip>
                                      <Tooltip
                                        placement="right"
                                        title={Language.change}
                                      >
                                        <div
                                          className={`${memu.camera} ${memu.btn}`}
                                          onClick={this._editPreview.bind(
                                            this,
                                            item
                                          )}
                                        >
                                          <Icon type="camera" />
                                        </div>
                                      </Tooltip>
                                      {SUPPORT_SCHOOL.indexOf(merchantID) >
                                        -1 &&
                                        (item.create_time >=
                                          "2020-02-01 00:00:00" ||
                                          item.publish_time >=
                                            "2020-02-01 00:00:00") && (
                                          <LandingPopup
                                            ref="LandingPopup"
                                            title={
                                              this.props.translations
                                                .initDone &&
                                              intl.get(
                                                "course_1.content.option.studentEdit"
                                              )
                                            }
                                            type={"studentedit"}
                                            width={1600}
                                            className={"manageModal"}
                                            style={styleCss.button}
                                            loginpic="barChart"
                                            courseId={item.ref_id}
                                            item={item}
                                            zIndex={777}
                                          />
                                        )}
                                    </React.Fragment>
                                  )}
                                  {item.type === "COURSE" &&
                                    this.state.staffPermit.delete && (
                                      <React.Fragment>
                                        <Tooltip
                                          placement="right"
                                          title={Language.delete}
                                        >
                                          <div
                                            className={`${memu.camera} ${memu.btn}`}
                                            onClick={this._delete.bind(
                                              this,
                                              item
                                            )}
                                          >
                                            <Icon type="delete" />
                                          </div>
                                        </Tooltip>
                                      </React.Fragment>
                                    )}
                                  {(item.res_type === "jttw360" ||
                                    item.res_type === "project") && (
                                    <React.Fragment>
                                      <Explore360
                                        item={item}
                                        classList={this.state.classList}
                                      />
                                    </React.Fragment>
                                  )}
                                  {item.type === "RESOURCE" &&
                                    staff.checkMerchant(item.school_id) &&
                                    permitUpdate && (
                                      <React.Fragment>
                                        <Tooltip
                                          placement="right"
                                          title={Language.set}
                                        >
                                          <div
                                            className={`${memu.btn} ${memu.camera}`}
                                            onClick={this.childOpend.bind(
                                              this,
                                              item,
                                              translations.initDone &&
                                                intl.get(
                                                  "course_1.content.PopupCoursware.edit"
                                                ),
                                              "update",
                                              item.ref_id
                                            )}
                                          >
                                            <Icon
                                              type={
                                                !!this.state.editLoading &&
                                                this.state.editLoading ===
                                                  item.ref_id
                                                  ? "loading"
                                                  : "setting"
                                              }
                                            />
                                          </div>
                                        </Tooltip>
                                      </React.Fragment>
                                    )}

                                  {courseID !== "school_resource" &&
                                    item.type === "RESOURCE" &&
                                    staff.checkMerchant(item.school_id) &&
                                    this.state.staffPermit.delete && (
                                      <React.Fragment>
                                        <Tooltip
                                          placement="right"
                                          title={Language.delete}
                                        >
                                          <div
                                            className={`${memu.camera} ${memu.btn}`}
                                            onClick={this._delete.bind(
                                              this,
                                              item
                                            )}
                                          >
                                            <Icon type="delete" />
                                          </div>
                                        </Tooltip>
                                      </React.Fragment>
                                    )}
                                </div>
                              )}
                              {item.type === "RESOURCE" && (
                                <>
                                  <div className={memu.warpLeft}>
                                    <React.Fragment>
                                      {item.res_type !== "project" && (
                                        <Tooltip
                                          placement="left"
                                          title={
                                            item.is_favourite === "Y"
                                              ? this.props.translations
                                                  .initDone &&
                                                intl.get(
                                                  "course_1.content.option.favouriteY"
                                                )
                                              : this.props.translations
                                                  .initDone &&
                                                intl.get(
                                                  "course_1.content.option.favouriteN"
                                                )
                                          }
                                        >
                                          <div
                                            className={`${memu.set} ${memu.btn}`}
                                            onClick={this.handleClickStar.bind(
                                              this,
                                              item,
                                              index
                                            )}
                                          >
                                            <Icon
                                              type={
                                                !!this.state.editLoading &&
                                                this.state.editLoading ===
                                                  item.ref_id
                                                  ? "loading"
                                                  : "star"
                                              }
                                              theme={
                                                item.is_favourite === "Y"
                                                  ? "filled"
                                                  : "outlined"
                                              }
                                            />
                                          </div>
                                        </Tooltip>
                                      )}
                                      {item.is_seen === "Y" &&
                                        !item.user_log.user_record_file &&
                                        !item.user_log
                                          .jttw_user_record_file && (
                                          <Tooltip
                                            placement="left"
                                            title={_fn("seen")}
                                          >
                                            <div
                                              className={`${memu.camera} ${memu.btn}`}
                                            >
                                              <Icon type="eye" theme="filled" />
                                            </div>
                                          </Tooltip>
                                        )}
                                      {(!!item.user_log.user_record_file ||
                                        !!item.user_log
                                          .jttw_user_record_file) &&
                                        !item.user_log.icon && (
                                          <div
                                            className={`${memu.camera} ${memu.btn}`}
                                          >
                                            <FilePreview
                                              file={
                                                item.user_log
                                                  .user_record_file ||
                                                item.user_log
                                                  .jttw_user_record_file
                                              }
                                            >
                                              <Icon type="file" />
                                            </FilePreview>
                                          </div>
                                        )}
                                    </React.Fragment>
                                  </div>
                                  {!!item.user_log.icon && (
                                    <div
                                      style={{
                                        width: 70,
                                        height: 70,
                                        position: "absolute",
                                        top: -20,
                                        left: -20,
                                      }}
                                    >
                                      <FilePreview
                                        id={item.user_log.ur_id}
                                        file={
                                          item.user_log.user_record_file ||
                                          item.user_log.jttw_user_record_file
                                        }
                                        showComment={
                                          item.res_type === "project"
                                        }
                                      >
                                        <img
                                          src={item.user_log.icon}
                                          style={{
                                            width: "100%",
                                            verticalAlign: "top",
                                          }}
                                          alt=""
                                        ></img>
                                      </FilePreview>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </Col>
                        )
                      );
                    })}
                  </QueueAnim>
                  <SchoolResource
                    onOpend={this.onOpend}
                    updateCallback={(res) => {
                      this.updateList();
                    }}
                  />
                </React.Fragment>
              );
            })}
          </InfiniteScroll>
        </Col>
        <Col span={24}></Col>
      </Row>
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

function mapDispatchToProps(dispatch) {
  return {
    updateFileName: (payload) => dispatch({ type: "updateFileName", payload }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseList);
