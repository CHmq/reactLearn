import React, { Component } from "react";
import {
  Row,
  Col,
  Empty,
  Button,
  Select,
  Skeleton,
  Divider,
  Spin,
  Icon,
  Tag,
  Input
} from "antd";
import { RESOURCE } from "config/course.json";
import intl from "react-intl-universal";
import { connect } from "react-redux";
import { Textfit } from "react-textfit";

import { Sticky } from "react-sticky";

import course from "components/services/courseService";
import ResourceSelectType from "components/resource/SelectType";

import styles from "assets/css/SubClass.module.scss";

import QueueAnim from "rc-queue-anim";

//新增课程子分类页面
class SubClass extends Component {
  $$mount = false;
  state = {
    tagList: [],
    select: [], // 选择的内容
    list: [],
    rsType: null,

    limit: 10,
    total: 0,
    loading: null,
    tagLoading: null,

    inputVisible: false,
    inputValue: "",

    preview: {}
  };

  componentDidMount = async () => {
    this.$$mount = true;

    if (!this.props.tagID) {
      throw new Error("INVALID_TAG_ID_ERROR");
    }

    if (!!this.$$mount) {
      this.setState({
        tagLoading: course
          .subClassTag(this.props.tagID)
          .then(ret => {
            ret.rows.map(item => {
              item.isTrue = false;
              return item;
            });
            return ret.rows;
          })
          .then(ret => {
            this.setState(
              {
                tagList: ret,
                tagLoading: null,
                select: _select,
                rsType: this.state.rsType || RESOURCE
              },
              this.updateList
            );
          })
      });
    }

    let _select = []; // [].concat(...this.props.data.tagData);

    // this.props.data.select = _select;
  };

  componentWillUnmount = async () => {
    this.$$mount = false;
  };

  //建立
  handlEstablish = () => {
    const { select, list, tagList } = this.state;
    if (typeof this.props.callback === "function") {
      this.props.callback({ tag: select, tagList, resource: list });
    }
    if (!!this.$$mount) {
      this.setState({
        select: [],
        list: []
      });
    }
  };

  genBackground = index => {
    let mapping = ["#92d9f8", "#ff8ea6", "#fff4de", "#c7ff72", "#bd9cff"];
    return mapping[index % mapping.length];
  };
  //選擇
  handleClick = (item, addOnly = false) => {
    let _idx = this.state.select.indexOf(item);
    let tagIdx = this.state.tagList.indexOf(item);
    let _select = this.state.select;
    let _tagList = this.state.tagList;

    if (_idx > -1) {
      !addOnly && _select.splice(_idx, 1);
      !addOnly && !!item.customize && _tagList.splice(tagIdx, 1);
    } else {
      _select.push(item);
      !(tagIdx > -1) && _tagList.push(item);
    }
    this.setState({ select: _select, tagList: _tagList }, this.updateList);
  };

  updateList = async (rs_type, i_limit) => {
    if (!!this.$$mount) {
      this.setState({
        loading: course
          .search({
            tag: this.props.tag,
            keyword: this.state.select.map(_select => _select.tag).join(","),
            type: rs_type || this.state.rsType,
            limit: i_limit || this.state.limit,
            show_total: true
          })
          .then(({ total, rows }) => {
            this.setState({ total, list: rows });
            return rows;
          })
          .then(ret => {
            this.setState({ loading: null });
          })
      });
    }
  };
  //返回
  back = () => {
    if (typeof this.props.prevStep === "function") {
      return this.props.prevStep();
    }
    return;
  };

  addTag = (tag = "") => {
    if (tag.trim() === "") {
      return;
    }
    let _idx = this.state.tagList.filter(_tag => {
      return _tag.name.toString() === tag || _tag.tag.toString() === tag;
    });
    return this.handleClick(
      _idx.length > 0
        ? _idx[0]
        : { name: tag, alias: tag, tag: tag, customize: true },
      true
    );
  };

  render() {
    const { picUrl, translations } = this.props;
    // const { select , list } = this.state;
    const {
      select,
      list,
      tagLoading,
      tagList,
      loading,
      rsType,
      limit,
      total,
      preview
    } = this.state;

    return (
      <Row type="flex" justify="start" style={{ background: "#fff" }}>
        <Col md={18} sm={16} xs={24} className={styles.card_container}>
          {!!tagLoading || tagList.length > 0 ? (
            <Row
              type={!!tagLoading ? "flex" : null}
              gutter={20}
              justify={!!tagLoading ? "center" : "start"}
              align={!!tagLoading ? "middle" : "top"}
              style={{ height: "100%" }}
            >
              {!!tagLoading && (
                <Spin
                  indicator={
                    <Icon type="loading" style={{ fontSize: 40 }} spin />
                  }
                  tip="Loading..."
                />
              )}
              {!tagLoading && (
                <Col xs={24}>
                  <Sticky>
                    {props => (
                      <div
                        style={{
                          ...props.style,
                          padding: "0.2rem 0",
                          backgroundColor: "white",
                          zIndex: 1000
                        }}
                      >
                        <div style={{ marginTop: "1rem" }}>
                          {!!this.state.inputVisible && (
                            <Input
                              ref={input => (this.input = input)}
                              type="text"
                              style={{ width: 150 }}
                              value={this.state.inputValue}
                              onChange={e => {
                                this.setState({ inputValue: e.target.value });
                              }}
                              onBlur={() => {
                                this.addTag(this.state.inputValue);
                                this.setState({
                                  inputVisible: false,
                                  inputValue: ""
                                });
                              }}
                              onPressEnter={() => {
                                this.addTag(this.state.inputValue);
                                this.setState({
                                  inputVisible: false,
                                  inputValue: ""
                                });
                              }}
                            />
                          )}
                          {!this.state.inputVisible && (
                            <Button
                              type="primary"
                              shape="round"
                              icon="plus"
                              onClick={() => {
                                this.setState({ inputVisible: true }, () =>
                                  this.input.focus()
                                );
                              }}
                            >
                              {translations.initDone &&
                                intl.get("general.button.subtopic")}
                            </Button>
                          )}
                        </div>
                        <div
                          className="d-inline-block hidden-sm"
                          style={{ marginTop: "0.5rem" }}
                        >
                          <QueueAnim
                            duration={100}
                            type={["right", "left"]}
                            ease={["easeInOutElastic"]}
                            leaveReverse
                          >
                            {tagList.map(item => (
                              <Tag.CheckableTag
                                color="geekblue"
                                style={{
                                  margin: "0.1rem",
                                  fontSize: "20px",
                                  padding: "0.4rem"
                                }}
                                key={item.name}
                                checked={select.indexOf(item) > -1}
                                onChange={selected => {
                                  this.handleClick(item);
                                }}
                              >
                                {item.name}
                              </Tag.CheckableTag>
                            ))}
                          </QueueAnim>
                        </div>
                      </div>
                    )}
                  </Sticky>
                  <div className="hidden visible-sm">
                    <QueueAnim duration={100} interval={80} type="scale">
                      {tagList.map((item, idx) => {
                        return (
                          <Col
                            lg={6}
                            md={8}
                            sm={12}
                            xs={12}
                            key={item.id}
                            onClick={() => {
                              this.handleClick(item);
                            }}
                            style={{ margin: "0.5rem auto" }}
                          >
                            <div
                              className={styles.card + " cursor-pointer"}
                              style={{
                                outline:
                                  select.indexOf(item) > -1
                                    ? "5px solid #ff4d4f"
                                    : "",
                                height: "150px",
                                background: picUrl
                                  ? `url(${picUrl})`
                                  : this.genBackground(idx),
                                padding: "0.5rem"
                              }}
                            >
                              <Textfit
                                forceSingleModeWidth={false}
                                mode="single"
                                min={1}
                                max={45}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                                className={"d-inline-flex"}
                              >
                                {item.name}
                              </Textfit>
                            </div>
                          </Col>
                        );
                      })}
                    </QueueAnim>
                  </div>
                </Col>
              )}
            </Row>
          ) : (
            preview.file ? (
              <div className={styles.previewWrap} >
                <div className={styles.imgWrap}>
                  <img src={preview.file} alt="" />
                  <h3>{preview.name}</h3>
                </div>
                <p>{preview.teaching_point}</p>
              </div>
            ) : <Empty style={{ marginTop: 100 }} />
          )}
        </Col>
        <Col
          md={6}
          sm={8}
          xs={24}
          style={{ background: "#ebf3ff", height: "100%", overflowY: "auto" }}
        >
          <div className={styles.list_container}>
            <h3>
              {!!loading
                ? translations.initDone &&
                  intl.get("general.title.courseware_name")
                : `${translations.initDone &&
                    intl.get("general.title.Paired")}：${list.length}/${total}`}
            </h3>
            <div
              style={{
                height: "calc(100vh - 430px)",
                overflowY: "auto",
                overflowX: "hidden"
              }}
            >
              <Skeleton paragraph={10} loading={!!loading} active>
                <QueueAnim component="ul" type={["right", "left"]} leaveReverse>
                  {list.map(item => (
                    <li key={item.id} style={{cursor: 'pointer'}} onClick={() => {this.setState({preview: item}); console.log(item)}}>
                      <Tag color="#108ee9">
                        {(this.props.translations.initDone &&
                          intl.get(
                            `home.publicMsg.resource_type.${item.type}`
                          )) ||
                          item.type}
                      </Tag>
                      {item.name}
                    </li>
                  ))}
                </QueueAnim>
              </Skeleton>
            </div>
          </div>
          <Divider style={{ margin: "0.5rem auto" }} />
          <div className={styles.select_container}>
            <h3>
              {translations.initDone &&
                intl.get("general.title.learning_activities")}
              ：
            </h3>
            <ResourceSelectType
              default={rsType}
              callback={rsType => {
                this.setState({ rsType }, () => {
                  this.updateList(rsType);
                });
              }}
            />
            <h3>
              {translations.initDone && intl.get("general.title.course_numer")}
              ：
            </h3>
            <Select
              size={"small"}
              defaultValue={limit}
              style={{ width: 120 }}
              onChange={_num => {
                this.setState({ limit: _num }, this.updateList);
              }}
            >
              {[5, 10, 15, 20, 30].map(_num => (
                <Select.Option key={_num} value={_num}>
                  {_num.toString()}
                </Select.Option>
              ))}
            </Select>
          </div>
          <Divider style={{ margin: "0.5rem auto" }} />
          <div className={styles.button_container}>
            <Button type="primary" onClick={this.back}>
              {translations.initDone && intl.get("info.content.Card.backbtn")}
            </Button>
            <Button type="primary" onClick={this.handlEstablish}>
              {translations.initDone &&
                intl.get("course_1.content.PopupCoursware.btnbuild")}
            </Button>
          </div>
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { route, user, translations, merchant } = state;
  return { route, user, translations, merchant };
}

export default connect(mapStateToProps, null, null)(SubClass);
