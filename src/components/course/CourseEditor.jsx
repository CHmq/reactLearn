//新增课程页面
import React, { Component } from "react";
import { Tabs, Row, Col, Drawer, Steps, Button, message } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import Resource from "components/course/Resource";
import SubClass from "components/course/SubClass";
import CourseData from "components/course/CourseData";
// import CourseSort from "components/course/CourseSort";
import course from "components/services/courseService";
// import img from "assets/image/addCourseBorder.png"

import QueueAnim from "rc-queue-anim";

import { StickyContainer } from "react-sticky";

const TabPane = Tabs.TabPane;

const styles = {
  // background: `url(${img}) no-repeat`,
  // padding: '21px 6px 6px 8px',
  border: "8px solid #e1ecff",
  borderRadius: 6,
  backgroundSize: "100%, 100%",
  marginBottom: 10
};

class CourseEditor extends Component {
  state = {
    visible: false, //彈框狀態
    title: "", // 标题
    category: [],
    data: [], //新增课程数据
    subPic: "", //子分类图片
    render: 1, //决定渲染父页面还是子页面
    resource: [],
    formData: {}, //课程资料页面传过来的表单数据
    activeKey: "1", //tab的key
    disabled: true,
    loading: false,

    _update: false
  };

  init = async () => {
    // const { updateFileName } = this.props;
    let list = await course
      .getCourseList()
      .then(ret => {
        return ret.rows.map(menu => {
          if (!!menu.parent_id) {
            menu.parent_name = (ret.rows.filter(
              _menu => _menu.id === menu.parent_id
            ) || [{ name: menu.parent_id }])[0].name;
          }
          return menu;
        });
      })
      .catch(_msg => {
        console.log(_msg);
      });
    this.setState({
      data: list.filter(menu => {
        return !!menu && !!menu.parent_id;
      }),
      category: list.filter(menu => {
        return !menu.parent_id;
      })
    });
  };

  //獲取頁面數據
  async componentDidMount() {
    // this.props.onRef(this);
    if (!this.state.visible) {
      return;
    }
    this.init();
  }
  //显示弹框
  showModal = res => {
    this.setState(
      {
        visible: true,
        data: [],
        category: [],
        _update: res,
        render: !!res ? 3 : 1
      },
      () => {
        this.init();
      }
    );
  };
  //隐藏弹框
  onCancel = () => {
    this.setState({
      visible: false,
      render: 1,
      activeKey: "1",
      disabled: true
    });
  };

  refresh = () => {
    typeof this.props.refresh === "function" && this.props.refresh();
  };

  _prevStep = () => {
    this.goStep(this.state.render - 1);
  };

  _nextStep = () => {
    this.goStep(this.state.render + 1);
  };

  goStep = (step = 1) => {
    let _state = { render: step };
    if (step.toString() === "1") {
      _state["resource"] = [];
    }
    this.setState(_state);
  };

  //渲染子分類頁面
  async subTag(item) {
    let { id, file, name, tag } = item;
    this._nextStep();
    this.setState(
      {
        selectedTitle: name,
        title: name,
        tag: tag,
        tagID: id,
        subPic: file
      },
      () => {}
    );
  }

  //子分類頁面返回
  backSubClass() {
    this.setState({
      render: 1
    });
  }
  //課程資料頁面下一步

  prevStep = () => {
    this.setState({ render: this.state.render - 1 });
  };

  nextStep() {
    this.setState({
      activeKey: "2",
      disabled: false
    });
  }

  //課程排序頁面上一步
  sortCancel() {
    this.setState({
      activeKey: "1",
      disabled: true
    });
  }

  //提交
  handleSubmit = async (info = { id: null }, itemList = []) => {
    this.setState({loading: true});
    let type = info.id ? "修改" : "添加";
    let AddOrUpdate = info.id ? "courseUpdate" : "courseAdd";
    return course[AddOrUpdate](
      info,
      itemList.map(item => {
        return item.type === "COURSE"
          ? null
          : { ref_id: item.id, type: "RESOURCE", sort: item.sort };
      })
    )
      .then(ret => {
        this.onCancel();
        this.refresh();
        message.success(`${type}成功`);
      })
      .catch(_msg => {
        message.error(`${type}失敗`);
      })
      .then(() => {
        this.setState({loading: false})
      });
  };

  _alert(render) {
    const { translations } = this.props;
    switch (render) {
      case 1:
        return (
          <div
            className="card-container"
            style={
              !(this.state.category.length > 0)
                ? { minHeight: "400px", backgroundColor: "white" }
                : {}
            }
          >
            <div style={{ margin: "16px" }}>
              <Button
                type="primary"
                shape="round"
                icon="plus"
                onClick={() => {
                  this.goStep(3);
                }}
              >
                {translations.initDone && intl.get("general.button.customize")}
              </Button>
            </div>
            <Tabs
              defaultActiveKey={
                (this.state.category[0] || [{ alias: 1 }]).alias
              }
              tabBarStyle={{ padding: "0 20px" }}
            >
              {this.state.category.map(menu => {
                return (
                  <TabPane
                    tab={menu.name}
                    key={menu.alias}
                    className={"tag-container"}
                  >
                    <Row style={{ padding: "0 1rem", margin: 0 }} gutter={10}>
                      <QueueAnim duration={100} interval={80} type="scale">
                        {this.state.data.length > 0
                          ? this.state.data.map(item => {
                              return item.parent_id.toString() ===
                                menu.id.toString() ? (
                                <Col key={item.id} lg={4} md={6} sm={8} xs={12}>
                                  <div style={styles}>
                                    <Resource
                                      onClick={() => {
                                        this.subTag(item);
                                      }}
                                      picUrl={item.file}
                                      title={item.name}
                                      titleBgcolor={"rgba(0, 110, 255, 0.5)"}
                                      height={109}
                                    />
                                  </div>
                                </Col>
                              ) : null;
                            })
                          : null}
                      </QueueAnim>
                    </Row>
                  </TabPane>
                );
              })}
            </Tabs>
          </div>
        );
      case 2:
        return (
          <SubClass
            picUrl={this.state.subPic}
            tag={this.state.tag}
            tagID={this.state.tagID}
            data={this.state.subData}
            prevStep={this._prevStep}
            callback={({ tag, resource, tagList }) => {
              this.setState(
                {
                  resource,
                  courseTitle: `${this.state.selectedTitle}${
                    tag.length === tagList.length || tagList.length === 0
                      ? ""
                      : "(" + tag.map(_select => _select.name).join(",") + ")"
                  }`,
                  title:
                    translations.initDone &&
                    intl.get("course_1.courseData.addTitle")
                },
                () => {
                  this._nextStep();
                }
              );
            }}
          />
        );
      case 3:
        return (
          <CourseData
            courseTitle={this.state.courseTitle}
            autoEdit={this.state.resource.length === 0}
            data={this.state.resource}
            URLid={this.props.URLid}
            prevStep={() => {
              if (!!this.state._update) {
                return;
              }
              this.state.resource.length === 0
                ? this.goStep(1)
                : this.prevStep();
            }}
            reset={() => {
              this.setState({ resource: [] });
            }}
            nextStep={this.handleSubmit}
            updateData={this.state._update}
            setChange={this.props.setChange}
            loading={this.state.loading}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { translations } = this.props;
    return (
      <Drawer
        title={
          <h3 style={{ textAlign: "center" }}>
            {!!this.state._update
              ? translations.initDone &&
                intl.get("course_1.courseData.editTitle")
              : translations.initDone &&
                intl.get("course_1.content.option.calssAdd")}
          </h3>
        }
        visible={this.state.visible}
        keyboard={true}
        wrapperClassName="EVI-Course-Editor"
        onCancel={this.onCancel}
        placement="right"
        closable={true}
        maskClosable={false}
        zIndex={300}
        onClose={() => {
          this.setState({ visible: false });
        }}
        afterVisibleChange={visible => {
          if (!visible) {
            this.onCancel();
          }
        }}
      >
        <StickyContainer>
          <Row className="course-editor-area">
            {this._alert(this.state.render)}
          </Row>
        </StickyContainer>
        {!this.state._update && (
          <Row
            style={{ ...{ padding: "1rem 0", borderTop: "1px solid #eaeaea" } }}
            className={"hidden visible-sm"}
          >
            <Col xs={{ span: 22, offset: 1 }}>
              <Steps current={this.state.render - 1}>
                <Steps.Step
                  title={
                    translations.initDone &&
                    intl.get("general.msg.select_topic")
                  }
                />
                <Steps.Step
                  title={
                    translations.initDone &&
                    intl.get("general.msg.select_subtopic")
                  }
                />
                <Steps.Step
                  title={
                    translations.initDone &&
                    intl.get("general.msg.release_settings")
                  }
                />
              </Steps>
            </Col>
          </Row>
        )}
      </Drawer>
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
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);
