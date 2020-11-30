/* eslint-disable no-unused-expressions */
import React, { Component } from "react";
import {
  Row,
  Col,
  Input,
  Icon,
  Avatar,
  Spin,
  Badge,
  Switch,
  message,
  Select,
} from "antd";
import { RESOURCE_ICON } from "config/course.json";
import { connect } from "react-redux";
import { Textfit } from "react-textfit";
import intl from "react-intl-universal";
import Animate from "rc-animate";
import InfiniteScroll from "react-infinite-scroller";
import SchoolResource from "components/course/schoolResourceEditor";

import ResourceSelectType from "components/resource/SelectType";
import Adapter from "components/resource/Adapter";
import ResourceWrap from "components/course/ResourceWrap";

import course from "components/services/courseService";
import staff from "components/services/staffService";
import user from "components/services/userService";
import PopupStudent from "components/PopupStudent";
import NewsModal from "components/common/NewsModal";

// import HomeChart from "components/chart/HomeChart";
import HomeChartVer from "components/chart/HomeChartVer";

import QueueAnim from "rc-queue-anim";

import styles from "assets/css/home.module.scss";

const { Option } = Select;

class Home extends Component {
  $$isMount = false;

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      $$loading: false,
      searchResult: [],
      staffPermit: false,
      display: true,
      keyword: "",
      extraKeyword: "",
      itemType: [],
      itemTag: [],
      hasMore: true,
      offset: 0,
      sort: "",
      order: "",
      searchParam: {},
    };
  }

  async componentDidMount() {
    this.$$isMount = true;

    this.props.updateFileName("home");

    if (this.props.user.type === "STUDENT") {
      this.getMenu();
    }

    if (!!this.$$isMount) {
      this.setState(
        {
          staffPermit: staff.checkRPermit({
            module: "resource",
            ctrl: "main",
            action: "get_list",
          }),
        },
        () => {
          if (!!this.state.staffPermit) {
            this.getMenu();
          }
        }
      );
    }
  }

  componentWillReceiveProps(nextProps) {
    const show = localStorage.getItem("show");
    const type = nextProps.user.type === "STUDENT" ? true : false;
    if (!!this.props.user && this.props.user.type === nextProps.user.type) {
      // return;
      if (!!type && !!show) {
        this.setState({ studentVisible: true, display: false });
      }
      return;
    }
  }
  close = () => {
    this.setState({ studentVisible: false, display: true });
    localStorage.removeItem("show");
  };

  componentWillUnmount = async () => {
    this.$$isMount = false;
  };

  getMenu = () => {
    if (!!this.state.$$loading) {
      return this.state.$$loading;
    }
    this.setState({
      $$loading: course
        .getMenu(this.props.$language, "")
        .then((ret) => {
          return ret
            .map((_item) => {
              return { ..._item, url: "course/" + _item.id };
            })
            .sort((a, b) => a.sort - b.sort);
        })
        .catch((_msg) => {
          console.log("NO_MAIN_MENU", _msg);
          return [];
        })
        .then((list) => {
          if (!!this.$$isMount) {
            this.setState({ list: list, $$loading: false, hasMore: false });
          }
        }),
    });
    return this.state.$$loading;
  };

  search = (
    keyword,
    rsType,
    offset = 0,
    limit = 20,
    loadMore = false,
    sort,
    order
  ) => {
    const { translations } = this.props;
    let $$call = course
      .search({
        tag: this.state.itemTag,
        keyword,
        type: rsType || this.state.itemType,
        offset,
        limit,
        show_total: true,
        school_only: this.state.school_only,
        sort: sort || this.state.sort,
        order: order || this.state.order
      })
      .then((ret) => {
        this.setState(
          { hasMore: ret.total > 20 ? offset * limit < ret.total : false },
          () => {
            if (!this.state.hasMore) {
              message.warning(
                translations.initDone && intl.get("general.no_more_record")
              );
            }
          }
        );
        return ret.rows;
      })
      .catch((err) => {
        return [];
      })
      .then((ret) => {
        if (!!this.$$isMount && $$call === this.state.$$loading) {
          this.setState({
            searchResult: !!loadMore
              ? this.state.searchResult.concat(ret)
              : ret,
            $$loading: false,
            searchParam: {
              keyword: keyword || "",
              type: rsType || this.state.itemType,
            },
          });
        }
      });
    this.setState({
      $$loading: $$call,
    });
    return this.state.$$loading;
  };

  handleInfiniteOnLoad = async () => {
    const { offset } = this.state;
    this.setState({ hasMore: false, offset: offset + 1 }, () => {
      if (
        Array.isArray(this.state.searchResult) &&
        this.state.searchResult.length > 0
      ) {
        this.search(
          this.state.keyword,
          this.state.itemType,
          this.state.offset,
          20,
          true
        );
      }
    });
  };

  InfiniteScrollInit = () => {
    this.setState({ offset: 0 });
  };

  // 获取子组件方法
  onOpend = (ref) => {
    this.child = ref;
  };

  resourceType = (type) => {
    if (RESOURCE_ICON.indexOf(type) > -1) {
      return true;
    } else return false;
  };

  onSelect = (order) => {
    const { keyword, type } = this.state.searchParam;
    const sort = !!order ? "publish_time" : "";
    if (order !== this.state.order) {
      this.setState({ sort, order, offset: 0 }, () => {
        this.search(keyword, type, 0, 20, false, sort, order);
      });
    }
  };

  render() {
    const Search = Input.Search;
    const { searchResult, sort } = this.state;
    const { translations, $language } = this.props;
    const searchEmpty =
      Array.isArray(this.state.searchResult) &&
      this.state.searchResult.length > 0;
    const displayList = !!searchEmpty
      ? this.state.searchResult
      : Array.isArray(this.state.list) && this.state.list.length > 0
      ? this.state.list.map((_mItem) => {
          return { ..._mItem, type: "COURSE" };
        })
      : [];
    const Loader = !!searchEmpty ? (
      <div key={0} style={{ textAlign: "center" }}>
        <Icon
          style={{ fontSize: 30, color: "rgb(24, 144, 255)" }}
          type="loading"
        />
      </div>
    ) : (
      ""
    );
    return (
      <div className={styles.bgCover}>
        <NewsModal page="home" />
        {!this.state.staffPermit
          ? this.props.user.type === "STUDENT" && (
              <PopupStudent
                visible={this.state.studentVisible}
                onClose={this.close}
                getImg={this.getImg}
              />
            )
          : ""}
        {this.state.display ? (
          <div>
            {!this.state.staffPermit ? (
              this.props.user.type === "STUDENT" && (
                <Row className={styles.bgHeight}>
                  {!!process.env.REACT_APP_AVATAR_URL && (
                    <iframe
                      title="studentbanner"
                      style={{
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                      }}
                      ref="iframe"
                      src={`${
                        process.env.REACT_APP_AVATAR_URL
                      }?accessToken=${user.getUToken()}&deviceID=${user.getUUID()}&lang=${
                        $language.value
                      }`}
                      scrolling="no"
                      frameBorder="0"
                      allow="autoplay"
                      gesture="media"
                      delegatestickyuseractivation="media"
                    />
                  )}
                </Row>
              )
            ) : (
              <Row
                type="flex"
                justify="center"
                align="middle"
                spacing={0}
                className={styles.home}
              >
                <HomeChartVer />
                <Col xs={18} md={18} lg={18} xl={16} style={{margin: "60px 0"}}>
                  <Search
                    size="large"
                    placeholder={
                      (translations.initDone &&
                        intl.get("home.publicMsg.search.placeholder")) ||
                      "搜尋 EVI 資源"
                    }
                    onSearch={(value) => {
                      this.InfiniteScrollInit();
                      this.search(value);
                    }}
                    onChange={(e) => {
                      this.InfiniteScrollInit();
                      this.setState({ keyword: e.target.value });
                      e.target.value === ""
                        ? this.setState({ searchResult: [] })
                        : void 0;
                    }}
                    allowClear
                    enterButton={
                      !!this.state.$$loading ? (
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
                    disabled={!!this.state.$$loading}
                    autoFocus
                    style={{ width : "calc(100% - 100px)"}}
                  />
                  <Animate showProp="visible" transitionName="fade">
                    <ResourceSelectType
                      visible
                      tagMode={true}
                      default={this.state.itemType}
                      callback={(itemList, tag, keyword) => {
                        this.InfiniteScrollInit();
                        this.setState(
                          {
                            itemType: itemList,
                            itemTag: tag,
                            extraKeyword: keyword,
                          },
                          () => {
                            this.search(
                              this.state.keyword + " " + this.state.extraKeyword
                            );
                          }
                        );
                      }}
                    />
                  </Animate>
                  <div style={{ marginTop: "0.5rem" }}>
                    {translations.initDone &&
                      intl.get("general.title.display_courseware")}
                    <Switch
                      checked={this.state.school_only}
                      checkedChildren={<Icon type="check" />}
                      unCheckedChildren={<Icon type="close" />}
                      onChange={(checked, event) => {
                        this.InfiniteScrollInit();
                        this.setState({ school_only: checked }, () => {
                          this.search(this.state.keyword);
                        });
                      }}
                      defaultChecked
                    />
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "50px",
                    }}
                  >
                    <SchoolResource
                      btnShow={true}
                      onOpend={this.onOpend}
                      addCallback={() => {
                        this.search(this.state.keyword);
                        this.InfiniteScrollInit();
                      }}
                      updateCallback={() => {
                        this.search(this.state.keyword);
                        this.InfiniteScrollInit();
                      }}
                    />
                  </div>
                </Col>
                {/* <Col style={{ margin: 4 }}>
                  <SchoolResource
                    btnShow={true}
                    onOpend={this.onOpend}
                    addCallback={() => {
                      this.search(this.state.keyword);
                      this.InfiniteScrollInit();
                    }}
                    updateCallback={() => {
                      this.search(this.state.keyword);
                      this.InfiniteScrollInit();
                    }}
                  />
                </Col> */}
              </Row>
            )}
            <InfiniteScroll
              initialLoad={false}
              pageStart={0}
              loader={Loader}
              loadMore={this.handleInfiniteOnLoad}
              hasMore={this.state.hasMore}
              useWindow={true}
            >
              <Row
                gutter={8}
                type="flex"
                justify="center"
                style={{ margin: "0.5rem auto 2.5rem" , maxWidth : 1200 }}
              >
                {!!searchResult.length && (
                  <Col
                    xs={24}
                    xxl={24}
                    style={{
                      maxWidth: "1100px",
                      textAlign: "right",
                      padding: "0 18px 18px 18px",
                    }}
                  >
                    <Select
                      defaultValue=""
                      style={{ width: 200 }}
                      onChange={this.onSelect}
                    >
                      <Option value="">
                        {translations.initDone &&
                          intl.get("general.title.searchResult.resultAbout")}
                      </Option>
                      <Option value="DESC">
                        {translations.initDone &&
                          intl.get("general.title.searchResult.resultAfter")}
                      </Option>
                      <Option value="ASC">
                        {translations.initDone &&
                          intl.get("general.title.searchResult.resultBefore")}
                      </Option>
                    </Select>
                  </Col>
                )}
                <Col
                  xs={24}
                  xxl={24}
                  className={styles.customCol}
                  style={{ maxWidth: "1200px" }}
                >
                  <QueueAnim
                    type="bottom"
                    interval={[60, 0]}
                    duration={[600, 0]}
                    ease={["easeInOutElastic"]}
                    leaveReverse={true}
                  >
                    {displayList.map((item, index) => {
                      return (
                        <Col
                          xs={8}
                          sm={{ span: 8, offset: 0 }}
                          md={{ span: 6, offset: 0 }}
                          xl={{ span: 5, offset: 0 }}
                          style={{ textAlign: "center", padding: "0.8rem" }}
                          key={item.id + index}
                        >
                          <Adapter
                            item={item}
                            res_type={item.type}
                            ref_id={item.id}
                            id={item.id}
                            nWindow={true}
                            style={{ position: "relative" }}
                          >
                            {item.type === "COURSE" ? (
                              <Avatar
                                src={item.file}
                                shape="square"
                                className={styles.resource}
                              />
                            ) : (
                              <ResourceWrap
                                open={() => {
                                  this.child.onOpend(
                                    item,
                                    translations.initDone &&
                                      intl.get(
                                        "course_1.content.PopupCoursware.edit"
                                      ),
                                    "update"
                                  );
                                }}
                                open2={() => {
                                  this.child.onOpend(
                                    item,
                                    translations.initDone &&
                                      intl.get(
                                        "course_1.content.PopupCoursware.edit"
                                      ),
                                    "update",
                                    null,
                                    true
                                  );
                                }}
                                item={item}
                              >
                                <img
                                  src={
                                    item.bg_file ||
                                    item.file ||
                                    require(`assets/image/noimage.jpg`)
                                  }
                                  style={{
                                    maxWidth: "200px",
                                    width: "100%",
                                    objectFit: "cover",
                                    height: "160px",
                                  }}
                                  alt=""
                                />
                                {item.bg_file && (
                                  <div
                                    title={item.name}
                                    className={styles.title}
                                  >
                                    {item.name}
                                  </div>
                                )}
                              </ResourceWrap>
                            )}

                            <Textfit
                              forceSingleModeWidth={false}
                              mode="single"
                              min={12}
                              max={45}
                              style={{
                                width: "100%",
                                height: "30px",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              className={"d-inline-flex"}
                            >
                              {this.resourceType(item.type)
                                ? !!item.type &&
                                  item.type !== "COURSE" && (
                                    <Avatar
                                      size="small"
                                      style={{ margin: "0 5px 5px 0" }}
                                      src={require(`assets/image/resource/icon/${item.type}.png`)}
                                    />
                                  )
                                : !!item.type &&
                                  item.type !== "COURSE" && (
                                    <Avatar
                                      size="small"
                                      style={{ margin: "0 5px 5px 0" }}
                                      src={require(`assets/image/resource/icon/file.png`)}
                                    />
                                  )}
                              {item.name}
                            </Textfit>
                            {item.type !== "COURSE" && (
                              <Badge
                                count={
                                  (translations.initDone &&
                                    intl.get(
                                      `home.publicMsg.resource_type.${item.type}`
                                    )) ||
                                  item.type
                                }
                              />
                            )}
                          </Adapter>
                        </Col>
                      );
                    })}
                  </QueueAnim>
                </Col>
              </Row>
            </InfiniteScroll>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

/** redux 獲得全局數據
 * route  route data (url, language)
 * user  user data (用戶數據)
 */
function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations,
  };
}

export default connect(mapStateToProps)(Home);
