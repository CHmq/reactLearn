//新增课程的课程资料页面
import React, { Component } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  DatePicker,
  // Radio,
  /*Empty,*/ TreeSelect,
  Badge,
  Switch,
  Icon,
  Select,
  Checkbox
} from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import BraftEditor from "braft-editor";
import moment from "moment";

import EditCourse from "components/course/EditCourse";
import school from "components/services/school";
import $style from "assets/css/CourseData.module.scss";

// const RadioButton = Radio.Button;
// const RadioGroup = Radio.Group;
const { SHOW_PARENT } = TreeSelect;

class CourseData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      classList: [],
      courseList: [],
      data: !this.isUpdate()
        ? this.props.data
        : this.props.data.map((_res) => {
            return { ..._res, id: _res.ref_id };
          }), //数据
      details: this.props.data[0], //右边栏显示课件详情
      status: "VALID", //Group选框
      publishTime: null, // 開始時間
      endTime: null, // 結束時間
      visiblePopupCoursware: false, // 搜尋課件
      treeData: [], //treeSelect 数据
      description: "",
      editor: BraftEditor.createEditorState(null),

      advPeriod: false,
      publishBeforePeriod: "N",
      publishAfterPeriod: "Y",
      cLang: [],
    };
  }

  isUpdate = () => {
    return !!this.props.updateData;
  };

  async componentDidMount() {
    this.$$isMount = true;
    this.setState({ visiblePopupCoursware: !this.isUpdate() });

    if (typeof this.props.treeData !== "undefined") {
      this.setState({ treeData: this.props.treeData });
    } else {
      this.treeSelectData();
    }

    if (!!this.isUpdate()) {
      const data = this.props.updateData;

      console.log(data);
      this.setState({
        courseList: data.item.filter((_res) => _res.type === "COURSE"),
        data: data.item
          .filter((_res) => _res.type === "RESOURCE")
          .map((_res) => {
            return { ..._res, type: _res.res_type, id: _res.ref_id };
          }),
        description: data.description,
        editor: BraftEditor.createEditorState(data.description),
        status: data.status,
        visiblePopupCoursware: true,
        publishTime:
          !!data.publish_time && moment(data.publish_time, "YYYY-MM-DD"),
        endTime: !!data.end_time && moment(data.end_time, "YYYY-MM-DD"),
        displayInPeriod: !!data.publish_before && !!data.publish_after,
        advPeriod: !!data.publish_before && !!data.publish_after,
        publishAfterPeriod: data.publish_after || "Y",
        classList: this.classFormatter(data.grade),
      });
      if(!!data.publish_time) {
        this.setState({
          publishBeforePeriod: data.publish_before,
        })
      }
      this.props.form.setFieldsValue({
        name: data.name,
        grade: data.grade,
        is_hot: data.is_hot === "Y",
      });
    } else {
      this.props.form.setFieldsValue({ name: this.props.courseTitle });
    }
  }

  componentWillUnmount = () => {
    this.$$isMount = false;
  };

  classFormatter = (i_classList) => {
    return [].concat(...i_classList).map((__ret) => {
      if (!__ret) {
        return null;
      }
      let map = __ret.split("-");
      let _ret = ((map || []).filter((___ret) => {
        return (
          ["PN", "K1", "K2", "K3", "INTEREST", "OTHER"].indexOf(___ret) > -1
        );
      }) || [null])[0];
      return map.length === 3 ? `dummy-${map[0]}-${map[2]}` : `dummy-${_ret}`;
    });
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
    this.setState({ classList: this.classFormatter(_ret) });
  };

  //treeSelect数据处理
  treeSelectData = async () => {
    const {
      route: { currentLocation },
    } = this.props;
    let data = await school.getClassTree(currentLocation);
    if (!!this.$$isMount) {
      this.setState({ treeData: data.classTree });
    }
  };

  //表單提交
  save = async (e) => {
    e.preventDefault();
    const value = this.props.form.getFieldsValue();
    const {
      publishTime,
      endTime,
      publishBeforePeriod,
      publishAfterPeriod,
      // displayInPeriod,
      cLang,
    } = this.state;
    const lang =
      cLang.length > 0
        ? cLang.map((_selectLang) => _selectLang.key.toString()).join(",")
        : this.props.route.supportLocale.lang.map((_lang) => _lang.value);

    // 是否置頂
    const is_hot = value.is_hot ? "Y" : "N";

    let obj = {
      course_id: this.props.URLid,
      name: value.name,
      description:
        (this.state.editor && this.state.editor.toHTML()) ||
        this.state.description,
      publish_time: (!!publishTime && publishTime.format("YYYY-MM-DD")) || null,
      end_time: (!!endTime && endTime.format("YYYY-MM-DD")) || null,
      publish_before: publishBeforePeriod,
      publish_after: publishAfterPeriod,
      status: this.state.status,
      grade: this.state.classList && this.state.classList.join(),
      is_hot,
      lang,
    };

    if (this.props.updateData) obj.id = this.props.updateData.id;

    if (typeof this.props.nextStep === "function") {
      this.props.nextStep(obj, this.state.data);
    }
    typeof this.props.setChange === "function" && this.props.setChange();
  };

  //禁用按鈕
  vaIidate = () => {
    const { getFieldsError, getFieldsValue } = this.props.form;
    const grade = getFieldsValue(["grade"]).grade;
    let isTrue = false;
    if (grade && grade.length > 0) {
      isTrue = true;
    }
    const value = Object.values(getFieldsValue(["name", "grade"])).every(
      (item) => item !== undefined && item !== "" && item !== null
    );
    const error = Object.values(getFieldsError(["name", "grade"])).every(
      (item) => item === "" || item === undefined || item !== null
    );
    return value === true && error === true && isTrue === true ? false : true;
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = (current) => {
    this.onChange("publishTime", current);
  };

  onEndChange = (current) => {
    this.onChange("endTime", current);
  };

  disabledEndDate = (endTime) => {
    const publishTime = this.state.publishTime;
    if (!endTime || !publishTime) {
      return endTime && endTime < moment().startOf("day");
    }
    return (
      endTime.valueOf() <= publishTime.valueOf() ||
      endTime < moment().startOf("day")
    );
  };
  // 日期 选择（发布日期、结束日期 end）

  //点击右边栏显示课件详情
  handleCourseClick(item) {
    this.setState({
      details: item,
    });
  }
  //删除课件
  handleCloseClick(index, e) {
    e.stopPropagation();
    let data = this.state.data;
    data.splice(index, 1);
    this.setState({
      data,
    });
  }
  //下一步
  nextStep() {
    this.props.nextStep();
  }
  //编辑
  handleClickCompile = () => {
    this.setState({
      visiblePopupCoursware: true,
    });
  };
  onCancel = () => {
    this.setState({
      visiblePopupCoursware: false,
    });
    this.props.reset();
  };

  compileDone = (data) => {
    this.setState({ data }, () => {
      console.log(this.state.data);
    });
    this.onCancel();
  };

  // 调用子组件
  onRef = (ref) => {
    this.child = ref;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      translations,
      route: { supportLocale },
    } = this.props;
    const controls = ["bold", "list-ul", "separator", "link"];
    // 多语言
    const _fn = function (value) {
      return (
        translations.initDone && intl.get("course_1.courseData.form." + value)
      );
    };
    const _fn1 = function (value) {
      return translations.initDone && intl.get("general.form." + value);
    };
    const Language = {
      name: _fn("name"),
      namerules: _fn("namerules"),
      namenull: _fn("namenull"),
      classname: _fn("classname"),
      grade: _fn("grade"),
      gradenull: _fn("gradenull"),
      description: _fn("description"),
      suggest: _fn1("suggest"),
      designation1: _fn1("designation"),
      before: _fn1("before"),
      after: _fn1("after"),
      forever: _fn1("forever"),
      whatever: _fn1("whatever"),
      language: _fn1("language"),
      top: _fn1("top"),
      status: _fn1("status"),
      advanced: _fn1("Advanced"),
      lock: _fn1("lock"),
      hide: _fn1("hide"),
      open: _fn1("open"),
    };

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 16,
          offset: 8,
        },
      },
    };

    return (
      <div className="course-editor-area">
        <Row type="flex" justify="start" style={{ overflow: "auto" }}>
          <Col lg={24} md={24} sm={24} xs={24}>
            <Form
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 18 }}
              onSubmit={this.save}
              style={{ padding: "0 15px" }}
            >
              <Row
                type="flex"
                justify="start"
                className="form_container"
              >
                <Col lg={{span: 12}} md={12} sm={24} xs={24}>
                  <Form.Item label={Language.name} hasFeedback>
                    {getFieldDecorator("name", {
                      rules: [
                        { required: true, message: Language.namerules },
                        { whitespace: true, message: Language.namenull },
                      ],
                    })(<Input placeholder={Language.classname} />)}
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                  <Form.Item label={Language.grade} hasFeedback>
                    {getFieldDecorator("grade", {
                      rules: [{ required: true, message: Language.gradenull }],
                      onChange: this.onSelect.bind(this),
                    })(
                      <TreeSelect
                        treeData={this.state.treeData}
                        filterTreeNode={(_search, node) =>
                          !!node.props &&
                          !!node.props.title &&
                          node.props.title
                            .toUpperCase()
                            .indexOf(_search.toUpperCase()) > -1
                        }
                        treeCheckable={true}
                        placeholder={
                          translations.initDone &&
                          intl.get("general.msg.choose_grade")
                        }
                        allowClear={true}
                        showSearch={true}
                        showCheckedStrategy={SHOW_PARENT}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={Language.description}
                    labelCol={{ span: 2 }}
                    wrapperCol={{ span: 21 }}
                  >
                    <BraftEditor
                      value={this.state.editor}
                      controls={controls}
                      placeholder={
                        translations.initDone &&
                        intl.get("general.msg.enter_text")
                      }
                      className={$style.bfEditor}
                      onChange={(editor) => {
                        this.setState({ editor });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                  <Form.Item label={Language.suggest} hasFeedback>
                    <DatePicker.RangePicker
                      value={[this.state.publishTime, this.state.endTime]}
                      onChange={(dates, dateString) => {
                        if (dates.length > 1) {
                          this.setState({
                            publishTime: dates[0],
                            endTime: dates[1],
                          });
                        } else {
                          this.setState({
                            publishTime: null,
                            endTime: null,
                            // displayInPeriod: false,
                          });
                        }
                      }}
                    />
                  </Form.Item>
                  {this.state.publishTime && this.state.endTime && (
                    <>
                      <Form.Item
                        label={Language.before}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {/* 推出日期前 */}
                        <Select
                          value={this.state.publishBeforePeriod}
                          onChange={(checked) => {
                            this.setState({ publishBeforePeriod: checked });
                          }}
                          style={{ width: "100%" }}
                        >
                          <Select.Option key={"before-open"} value={null}>
                            <Icon type="eye" /> {Language.open}
                          </Select.Option>
                          <Select.Option key={"before-visible"} value={"Y"}>
                            <Icon type="lock" /> {Language.lock}
                          </Select.Option>
                          <Select.Option key={"before-invisible"} value={"N"}>
                            <Icon type="eye-invisible" /> {Language.hide}
                          </Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        label={Language.after}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 18 }}
                      >
                        {/* 推出日期後 */}
                        <Select
                          value={this.state.publishAfterPeriod}
                          onChange={(checked, e) => {
                            this.setState({ publishAfterPeriod: checked });
                          }}
                          style={{ width: "100%" }}
                        >
                          <Select.Option key={"after-visible"} value={"Y"}>
                            <Icon type="eye" /> {Language.open}
                          </Select.Option>
                          <Select.Option key={"after-invisible"} value={"N"}>
                            <Icon type="eye-invisible" /> {Language.hide}
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </>
                  )}
                  <Form.Item label={Language.language} hasFeedback>
                    <Select
                      labelInValue
                      mode="multiple"
                      placeholder={Language.language}
                      value={this.state.cLang}
                      onChange={(lang) => {
                        this.setState({ cLang: lang });
                      }}
                      style={{ width: "100%" }}
                    >
                      {!!supportLocale &&
                        supportLocale.lang
                          .filter((_lang) => {
                            return (
                              !this.state.cLang
                                .map(
                                  (_selectLang) =>
                                    _selectLang.key.toString() ===
                                    _lang.value.toString()
                                )
                                .filter((_selectLang) => !!_selectLang).length >
                              0
                            );
                          })
                          .map((_lang) => (
                            <Select.Option
                              key={_lang.value.toString()}
                              value={_lang.value}
                            >
                              {_lang.name}
                            </Select.Option>
                          ))}
                    </Select>
                  </Form.Item>
                  <Form.Item label={Language.top}>
                    {getFieldDecorator("is_hot", { valuePropName: "checked" })(
                      <Switch />
                    )}
                  </Form.Item>
                </Col>
                <Col 
                  span={0}
                  // lg={12} md={12} sm={24} xs={24}
                >
                  <Form.Item label="自動發送提示">
                    {getFieldDecorator("is_hot", { valuePropName: "checked" })(
                      <Switch />
                    )}
                    <div style={{margin: '10px 0'}}>
                      <Checkbox.Group onChange={() => {}}>
                        <Checkbox value="A">APP內訊息提示</Checkbox>
                        <Checkbox value="B">網頁版本提示</Checkbox>
                      </Checkbox.Group>
                    </div>
                    <div>
                      課程完結前每隔&nbsp;
                      <Select
                        value={1}
                        onChange={(checked) => {}}
                        style={{width: 50, heigth: 20, lineHeight: '20px'}}
                      >
                        {[1,2,3,4,5,6,7].map(item => (
                          <Select.Option key={"day_" + item} value={item}>
                            {item}
                          </Select.Option>
                        ))}
                      </Select>&nbsp;天發送提示給【
                      <Checkbox.Group onChange={() => {}} style={{paddingLeft: 8}}>
                        <Checkbox value="A">已查閱</Checkbox>
                        <Checkbox value="B">未查閱</Checkbox>
                      </Checkbox.Group>		
                      】的用戶直至&nbsp;
                      <DatePicker onChange={() => {}} />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
          <Col span={24}>
            <h4 style={{ textAlign: "center" }}>
              {Language.status}：
              <span style={{ color: "red" }}>
                *
                {
                  this.state.publishBeforePeriod === null &&
                  this.state.publishAfterPeriod === "Y" &&
                  (<React.Fragment>{Language.whatever}</React.Fragment>)
                  ||
                  (
                    !!this.state.publishTime &&
                    (
                      <React.Fragment>
                        {this.state.publishTime.format("LL")}
                        {this.state.publishAfterPeriod === "Y" && Language.forever || ` - ${this.state.endTime.format("LL")}`}
                        ，{Language.before}&nbsp;-&nbsp;
                        {this.state.publishBeforePeriod === "Y" && Language.lock}
                        {this.state.publishBeforePeriod === "N" && Language.hide}
                        {this.state.publishBeforePeriod === null && Language.open}
                      </React.Fragment>
                    )
                  )
                }
              </span>
            </h4>
            <Row
              type="flex"
              gutter={8}
              className="button_container"
              align="middle"
              justify="center"
              style={{ margin: 0 }}
            >
              <Col>
                <div style={{ margin: "0.5rem 1rem" }}>
                  <EditCourse
                    keyword={this.props.keyword}
                    tag={this.props.courseTitle}
                    onRef={this.onRef}
                    selected={this.state.data}
                    callback={(resList) => this.compileDone(resList)}
                    zIndex={400}
                    visible={this.state.visiblePopupCoursware}
                    onCancel={this.onCancel}
                  />
                  <Badge count={this.state.data.length} overflowCount={20}>
                    <Button type="primary" onClick={this.handleClickCompile}>
                      {translations.initDone &&
                        intl.get("course_1.courseData.button.cancel")}
                    </Button>
                  </Badge>
                </div>
              </Col>
              {/* 隐藏上一步按钮 */}
              {/* <Col>
                {!!this.props.prevStep && !this.isUpdate() && (
                  <Button
                    type="primary"
                    onClick={this.props.prevStep || void 0}
                    style={{ margin: "0.5rem 1rem" }}
                  >
                    {translations.initDone &&
                      intl.get("course_1.courseData.button.cancel")}
                  </Button>
                )}
              </Col> */}
              <Col>
                <Button
                  type="primary"
                  onClick={this.save}
                  disabled={this.vaIidate()}
                  loading={this.props.loading}
                  style={{ margin: "0.5rem 1rem" }}
                >
                  {translations.initDone &&
                    intl.get("course_1.courseSort.button.done")}
                </Button>
              </Col>
            </Row>
          </Col>
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
)(Form.create()(CourseData));
