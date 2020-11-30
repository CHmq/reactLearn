import React, { Component } from "react";
import {
  Row,
  Col,
  Input,
  Button,
  Icon,
  Spin,
  Switch,
  Skeleton,
  Tag,
  Tabs,
  Badge,
  Avatar,
} from "antd";
import { RESOURCE } from "config/course.json";
import InfiniteScroll from "react-infinite-scroller";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import QueueAnim from "rc-queue-anim";
import arrayMove from "array-move";

import { SortableContainer, SortableElement } from "react-sortable-hoc";

import ManagePopup from "components/common/ManagePopup";
import SchoolResource from "components/course/schoolResourceEditor";
import Resource from "components/course/Resource";
import ResourceWrap from "components/course/ResourceWrap";
import ResourceSelectType from "components/resource/SelectType";
import Adapter from "components/resource/Adapter";
import courseService from "components/services/courseService";

import style from "assets/css/PopupCoursware.module.scss";
import { list_container } from "assets/css/SubClass.module.scss";

const Search = Input.Search;

class EditCourse extends Component {
  $$isMount = false;
  $$drag = false;

  constructor(props) {
    super(props);
    this.state = {
      loading: null,

      tagList: [], // 选择器
      tag: "", // 选择器第一个name
      width: 930,

      // showData: {
      //   title: "",
      //   src: null,
      //   word: ""
      // },

      showData: {},

      tabActiveKey: "list",
      hidden: false,
      school_only: false,

      itemList: [],
      keyword: "",
      offset: 0,
      total: 0,
      limit: 20,

      list: [],
      result: [],
    };
  }

  componentDidMount() {
    this.$$isMount = true;
    this.props.onRef(this); // 被父类调用
    this.updateList();
  }

  updateList = (_callback = () => {}) => {
    this.setResult(this.props.selected, () => {
      this.setState(
        {
          list: this.getResult(this.props.selected),
        },
        _callback
      );
    });
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (prevProps.visible !== this.props.visible && !!this.props.visible) {
      this.updateList();
    }
    return;
  };

  componentWillUnmount() {
    this.$$isMount = false;
  }

  hasMore = () => {
    return (this.state.offset + 1) * this.state.limit < this.state.total;
  };

  reset = (offset = true, result = true, itemList = false) => {
    !!itemList && this.setState({ itemList: RESOURCE });
    !!result && this.setState({ list: [], result: [] });
    !!offset && this.setState({ offset: 0, total: 0, limit: 20 });
    this.setState({ loading: null });
  };

  advSort = (a, b) =>
    a.active === b.active
      ? (a.sort || b._score) - (b.sort || a._score)
      : !!a.active
      ? -1
      : 1;

  // setAds = async({name ='' , file ='' , teaching_point = '' , description = ''} , showInfo = true) => {
  //   this.setState({tabActiveKey : (!!showInfo && "info") || this.state.tabActiveKey , showData: {title: name, src:  file, word: teaching_point || description }});
  // }

  setAds = async (item, showInfo = true) => {
    this.setState({
      tabActiveKey: (!!showInfo && "info") || this.state.tabActiveKey,
      showData: item,
    });
  };

  setResult = (result = [], i_setList = true, i_sort = false) => {
    this.setState(
      {
        result: result
          .map((_res, idx) => {
            return {
              ..._res,
              active: true,
              sort: !!i_sort ? idx + 1 : _res.sort || idx + 1,
            };
          })
          .filter((_res) => !!_res)
          .sort(this.advSort),
      },
      () => {
        if (i_setList === true) {
          this.setState({ list: this.getResult(this.state.list) });
        } else if (typeof i_setList === "function") {
          i_setList(this.state.result);
        }
      }
    );
  };

  getResult = (_fetchList) => {
    let _ret = [
      ...this.state.result.map((_res, idx) => {
        return { ..._res, active: true, sort: _res.sort || idx + 1 };
      }),
      ..._fetchList.map((_res) => {
        return this.hasSelected(_res, false)
          ? null
          : { ..._res, active: false };
      }),
    ]
      .filter((_res) => !!_res)
      .sort(this.advSort);
    return _ret;
  };

  onRrefresh = async () => {
    this.getList();
  }

  //滑动加载
  loadMore = async () => {
    if (!!this.$$drag) return;
    if (!!this.state.loading) {
      return this.state.loading;
    }

    this.setState({ offset: this.state.offset + 1 });
    let $$call = this.getList(false)
      .then((ret) => {
        if (!this.state.loading) throw new Error("NOT_LAST_CALL");
        let list = this.getResult([...this.state.list, ...ret]);
        this.setState({ list, loading: null });
      })
      .catch((_err) => {
        console.log(_err);
        return [];
      })
      .then((_ret) => {
        this.setState({ loading: null });
        return _ret;
      });
    return $$call;
  };
  // 获取列表数据  备注：header（父组件） 组件获取调用
  getList = async (autoSet = true) => {
    let itemList = this.state.itemList.map((_item) => {
      return _item.split(",");
    });

    let $$call = courseService
      .search({
        keyword: this.state.keyword,
        type: [].concat(...itemList),
        offset: !!autoSet ? 0 : this.state.offset,
        limit: this.state.limit,
        show_total: true,
        school_only: this.state.school_only
      })
      .then((_ret) => {
        if (this.state.loading !== $$call) throw new Error("NOT_LAST_CALL");
        this.setState({ total: _ret.total });
        return _ret.rows;
      })
      .then((_ret) => {
        if (!!autoSet) {
          _ret = this.getResult(_ret);
          this.setState(
            {
              list: _ret,
            },
            () => {
              if (_ret.length > 0) {
                this.setAds(_ret[0]);
              }
            }
          );
        }
        return _ret;
      })
      .catch((_err) => {
        console.log(_err);
        return [];
      })
      .then((_ret) => {
        if (!!autoSet) {
          this.setState({ loading: null });
        }
        return _ret;
      });

    this.setState({ loading: $$call });
    return $$call;
  };

  // 复选择框
  onChange(itemList) {
    this.setState({ itemList }, this.getList);
  }

  // 點擊獲取當前的值
  selectResource(res, key, e) {
    let _result = this.state.result;
    let _idx = this.hasSelected(res),
      active = _idx > -1;

    if (!active) {
      this.setAds(res, false);
    }
    !active ? _result.push(res) : _result.splice(_idx, 1);
    this.setResult(_result, true, true);
  }

  hasSelected = (res, isRetKey = true) => {
    let ret =
      this.state.result.filter(
        (_select) => !!_select.id && _select.id.toString() === res.id.toString()
      ) || [];
    return !!isRetKey
      ? this.state.result.indexOf(ret.length > 0 ? ret[0] : [])
      : ret.length > 0;
  };

  // 获取子组件方法
  onOpend = (ref) => {
    this.child = ref;
  };

  callback = () => {
    if (typeof this.props.callback === "function") {
      this.props.callback(this.state.result);
      this.reset(false, true, false);
    }
    return this.state.result;
  };

  render() {
    const { translations } = this.props;
    const { showData } = this.state;
    // 多语言
    const _fn = function (value) {
      return (
        translations.initDone &&
        intl.get("course_1.content.PopupCoursware." + value)
      );
    };

    const Language = {
      title: _fn("title"),
      changeItem: _fn("changeItem"),
      Teachingfocus: _fn("Teachingfocus"),
      btnnew: _fn("btnnew"),
      btnbuild: _fn("btnbuild"),
      edit: _fn("edit"),
    };
    const SortableItem = SortableElement(({ item, index }) => {
      return (
        <Col md={6} xs={24} key={item.id.toString()}>
          <div
            className={`${style.item} ${
              this.hasSelected(item, false) ? `${style.active}` : ""
            }`}
          >
            <Icon
              type={
                this.hasSelected(item, false) ? "minus-circle" : "plus-circle"
              }
              theme="twoTone"
              twoToneColor={
                this.hasSelected(item, false) ? "#ff4d4f" : "#52c41a"
              }
              style={{ position: "absolute", zIndex: 10, fontSize: "24px" }}
              onClick={this.selectResource.bind(this, item, index)}
            />
            <ResourceWrap
              open={() => {
                this.child.onOpend(item, Language.edit, "update");
              }}
              open2={() => {
                this.child.onOpend(
                  item,
                  translations.initDone &&
                    intl.get("course_1.content.PopupCoursware.edit"),
                  "update",
                  null,
                  true
                );
              }}
              item={item}
              name={item.type}
            >
              <Resource
                picUrl={item.bg_file || item.file}
                title={item.name}
                titleFontSize="12px"
                titleBgcolor={"rgba(0, 0, 0, 0.5)"}
                onClick={() => {
                  this.setAds(item);
                }}
              />
              <div style={{ background: "white" }}>
                <div>
                  {(item.grade || []).map((ret, index) => (
                    <Avatar
                      key={index}
                      style={{
                        backgroundColor: "#22b14c",
                        margin: "0.2rem 0.1rem",
                      }}
                    >
                      {ret}
                    </Avatar>
                  ))}
                </div>
                <Avatar
                  style={{
                    backgroundColor: "#be10e9",
                    margin: "0.2rem 0.1rem",
                  }}
                >
                  {
                    ((this.props.translations.initDone &&
                      intl.get(`home.publicMsg.resource_type.${item.type}`)) ||
                      item.type)[0]
                  }
                </Avatar>
                {["zh", "english", "cn"].map((lang) => {
                  return (
                    (item.lang || []).filter(
                      (_res) => _res.lang.toString() === lang
                    ).length > 0 && (
                      <Avatar
                        key={`${item.id.toString()}-${lang.toString()}`}
                        style={{
                          backgroundColor: "#108ee9",
                          margin: "0.2rem 0.1rem",
                        }}
                      >
                        {(this.props.translations.initDone &&
                          intl.get(`general.lang.${lang}`)) ||
                          lang}
                      </Avatar>
                    )
                  );
                })}
              </div>
            </ResourceWrap>
          </div>
        </Col>
      );
    });

    const SortableList = SortableContainer(({ items }) => {
      return (
        <Row type="flex" justify="start">
          {items.map((item, key) => {
            return (
              ((!!this.state.hidden && !this.hasSelected(item, false)) ||
                !this.state.hidden) && (
                <SortableItem
                  disabled={!this.hasSelected(item, false)}
                  key={`item-${key}`}
                  index={key}
                  item={item}
                />
              )
            );
          })}
        </Row>
      );
    });
    return (
      <ManagePopup
        title={Language.title}
        width={this.state.width}
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        zIndex={this.props.zIndex}
        maskClosable={false}
        footer={[
          <Button
            key="build-course-resource"
            type="primary"
            onClick={this.callback}
          >
            {Language.btnbuild}
          </Button>,
        ]}
      >
        <React.Fragment>
          <Row type="flex" justify="center" className={style.main}>
            <Col span={24}>
              <Col md={18} xs={24} className={style.leftmain}>
                <Row type="flex" gutter={4}>
                  <Col span={21}>
                    <Col span={24} style={{ marginBottom: 5 }}>
                      <Search
                        defaultValue={this.state.keyword}
                        placeholder={
                          this.props.translations.initDone &&
                          intl.get("general.msg.search")
                        }
                        onSearch={(_keyword) => {
                          this.setState({ keyword: _keyword }, this.getList);
                        }}
                        allowClear
                        enterButton={
                          !!this.state.loading ? (
                            <Spin
                              indicator={
                                <Icon
                                  type="loading"
                                  style={{ fontSize: 24 }}
                                  spin
                                />
                              }
                            />
                          ) : (
                            true
                          )
                        }
                        disabled={!!this.state.loading}
                        autoFocus
                      />
                    </Col>
                    <Col span={24}>
                      <ResourceSelectType
                        default={this.state.itemList}
                        callback={this.onChange.bind(this)}
                      />
                    </Col>
                  </Col>
                  <Col span={3}>
                    <SchoolResource
                      btnShow={true}
                      onOpend={this.onOpend}
                      addCallback={(res) => {
                        if(res) {
                          let result = this.state.result;
                          result.push(res);
                          this.setResult(result);
                        }
                      }}
                      updateCallback={(res) => {
                        if(res) {
                          let result = this.state.result,
                          _ret = result.filter(
                            (_res) => _res.id.toString() === res.id.toString()
                          );
                          result[result.indexOf(_ret[0])] = res;
                          this.setResult(result);
                          return;
                        }
                        this.onRrefresh();
                      }}
                    />
                  </Col>
                  <Col span={24}>
                    <div style={{ marginRight: "0.3rem" }}>
                      {translations.initDone &&
                        intl.get("general.title.hide_courseware")}
                      ：
                      <Switch
                        checked={this.state.hidden}
                        checkedChildren={<Icon type="check" />}
                        unCheckedChildren={<Icon type="close" />}
                        onChange={(checked, event) => {
                          this.setState({ hidden: checked });
                        }}
                        defaultChecked
                      />
                    </div>
                    <div>
                      {translations.initDone &&
                        intl.get("general.title.display_courseware")}
                      ：
                      <Switch
                        checked={this.state.school_only}
                        checkedChildren={<Icon type="check" />}
                        unCheckedChildren={<Icon type="close" />}
                        onChange={(checked, event) => {
                          this.setState({ school_only: checked }, () => {
                            this.getList();
                          });
                        }}
                        defaultChecked
                      />
                    </div>
                  </Col>
                  <Col span={24}>
                    <div className={style.scroll_container}>
                      <InfiniteScroll
                        initialLoad={false}
                        pageStart={0}
                        loader={
                          <div className="loader" key={0}>
                            Loading ...
                          </div>
                        }
                        loadMore={this.loadMore}
                        hasMore={this.hasMore()}
                        useWindow={false}
                      >
                        <SortableList
                          updateBeforeSortStart={() => {
                            this.$$drag = true;
                          }}
                          pressDelay={100}
                          axis="xy"
                          items={this.state.list}
                          helperClass="cousre-item-sortable"
                          onSortEnd={({ oldIndex, newIndex }) => {
                            let _result = arrayMove(
                              this.state.result,
                              oldIndex,
                              newIndex
                            );
                            this.setResult(_result, true, true);
                            this.$$drag = false;
                          }}
                        />
                      </InfiniteScroll>
                    </div>
                  </Col>
                </Row>
              </Col>
              <Col
                md={6}
                xs={0}
                className={style.rigthmain}
                style={{ padding: 0 }}
              >
                <Tabs
                  size="small"
                  style={{ height: "100%" }}
                  activeKey={this.state.tabActiveKey}
                  onChange={(key) => {
                    this.setState({ tabActiveKey: key });
                  }}
                >
                  <Tabs.TabPane
                    style={{ height: "100%" }}
                    className={list_container}
                    tab={
                      <Badge
                        count={this.state.result.length}
                        overflowCount={99}
                      >
                        <span style={{ marginRight: "1rem" }}>
                          {translations.initDone &&
                            intl.get("general.title.courseware_list")}
                        </span>
                      </Badge>
                    }
                    key="list"
                  >
                    <div>
                      <Skeleton paragraph={10} loading={!this.$$isMount} active>
                        <QueueAnim
                          component="ul"
                          type={["right", "left"]}
                          leaveReverse
                          style={{
                            maxHeight: "350px",
                            overflow: "hidden auto",
                          }}
                        >
                          {this.state.result.map((item) => {
                            return (
                              !!item.id && (
                                <li
                                  key={item.id.toString()}
                                  className={"cursor-pointer"}
                                  onClick={() => {
                                    this.setAds(item);
                                  }}
                                >
                                  {" "}
                                  <Tag color="#108ee9">
                                    {(this.props.translations.initDone &&
                                      intl.get(
                                        `home.publicMsg.resource_type.${item.type}`
                                      )) ||
                                      item.type}
                                  </Tag>
                                  {item.name}
                                </li>
                              )
                            );
                          })}
                        </QueueAnim>
                      </Skeleton>
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    style={{ height: "100%" }}
                    tab={
                      this.props.translations.initDone &&
                      intl.get("general.title.courseware_content")
                    }
                    disabled={!showData.name}
                    key="info"
                  >
                    {!!showData.name && (
                      <div>
                        <h3 className={`${style.titleCB} ${style.fontW}`}>
                          {showData.name}
                        </h3>
                        <Resource picUrl={showData.file} />
                        <h4 className={`${style.titleCB} ${style.fontW}`}>
                          {Language.Teachingfocus}:
                        </h4>
                        <p
                          className={style.titleCB}
                          dangerouslySetInnerHTML={{
                            __html:
                              showData.teaching_point || showData.description,
                          }}
                        />
                        <div className={style.details}>
                          <Adapter
                            item={showData}
                            res_type={showData.type}
                            id={showData.id}
                            ref_id={showData.id}
                            nWindow={true}
                          >
                            {this.props.translations.initDone &&
                              intl.get("general.button.details")}
                          </Adapter>
                        </div>
                      </div>
                    )}
                  </Tabs.TabPane>
                </Tabs>
              </Col>
            </Col>
          </Row>
        </React.Fragment>
      </ManagePopup>
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

export default connect(mapStateToProps)(EditCourse);
