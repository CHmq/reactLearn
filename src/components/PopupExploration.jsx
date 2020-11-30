import React, { Component } from "react";
import exploration from "./services/courseService";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import {Button, List, Card, Icon, Empty, Row, Col, Spin, message, Skeleton} from "antd";
import InfiniteScroll from "react-infinite-scroller";


import styles from "assets/css/PopupExploration.module.scss";

class Message extends Component {
  state = {
    list: [],
    data: [],
    loading: false,
    hasMore: true,
    exploreData: [], // 处理加载数据
    needLoading: false, // 是否还要加载 Antd
    setOffset: 0, // 设置offset 默认为0
    getloading: true // 能获取数据请求，防止滚动多次进行多次请求
  };

  // async componentDidMount() {
  //   // this.getExploreData();
  // }

  getExploreData = async (offset = 10, limit = 10) => {
    // console.log(offset)
    // console.log(limit)
    let urlId = this.props.urlId
    // console.log(this.props.urlId)
    let dataRows = [];
    this.setState({
      list: await exploration
        .ExploratioList(offset, limit,urlId)
        .then(ret => {
          console.log(ret);
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg );
          return [];
        })
    });
    dataRows = this.state.list.rows;
    this.setState({
      exploreData: dataRows,
      loading: false
    });
    console.log(dataRows)
    if (dataRows.length === 0) {
      // 停止下拉加载
      this.setState({
        needLoading: false,
        getloading: false // 不可以滚动加载了
      });
      console.log("停止加载事件开启");
    } else {
      // 加载数据长度不为0条时候继续加载
      this.setState({
        needLoading: true,
        getloading: true // 可以滚动加载了
      });
      this.handleInfiniteOnLoad()
    }
  };

  // 滚动处理
  handleInfiniteOnLoad = () => {
    let arr = this.props.data.rows; // 目前渲染的数据
    const loadingData = this.state.exploreData; // 请求加载获取 探索 新的数据
    let can = this.state.getloading; // 是否继续加载请求
    let num = this.state.setOffset; // 滚动次数
    if (can) {
      if (loadingData !== arr) {
        arr = arr.concat(loadingData); // 合并
      }
      num += 10; // 加载条数每加载一页新+10
      this.setState({
        loading: true,
        setOffset: num,
        getloading: false,
        data: arr
      });
      console.log(this.state.data);
      this.getExploreData(num);
    }
    // 加载完毕处理
    if (!this.state.needLoading) {
      message.warning(this.translations.initDone && intl.get("general.no_more_record"));
      this.setState({
        hasMore: false,
        loading: false
      });
      return;
    }
  };

  //關閉彈出框
  onCancel = () => {
    this.props.onCancel();
  };

  render() {
    const reg = ".(jpg|gif|jpeg|png)+$";
    const { rows, total } = this.props.data;
// console.log(this.props)
    return (
      <div className={styles.wrap}>
        <Row style={{ borderRadius: 30, overflow: "hidden" }}>
          <Col xs={0} md={9}>
            <img
              style={{ width: "100%" }}
              src={require("assets/image/more_03.png")}
              alt="pupupType"
            />
          </Col>
          <Col xs={24} md={0}>
            <div className={styles.xs_title}>
              <h2>專題探索</h2>
            </div>
          </Col>
          <Col xs={24} md={15}>
           <div className={styles.demo_infinite_container}>
              <Skeleton active loading={total === 0 ? true : false}>
                <InfiniteScroll
                  initialLoad={false}
                  pageStart={0}
                  loadMore={this.handleInfiniteOnLoad}
                  hasMore={!this.state.loading && this.state.hasMore}
                  useWindow={false}
                >
                  {rows ? (
                    <List
                      grid={{ gutter: 16, column: 2 }}
                      dataSource={rows}
                      renderItem={item => (
                        <List.Item key={item.id}>
                          <Card className={styles.card}>
                            <div className={styles.pic}>
                              {item.file.match(reg) ? (
                                <img src={item.file} alt="" />
                              ) : (
                                <video
                                  width="100%"
                                  height="100%"
                                  src={item.file}
                                  controls
                                />
                              )}
                            </div>
                            <div className={styles.detail}>
                              <Row
                                type="flex"
                                justify="space-between"
                                align="middle"
                              >
                                <Col span={12}>
                                  <p>{item.name}</p>
                                </Col>
                                <Col span={12}>
                                  <Button>
                                    <Icon type="like" />
                                    {item.like}
                                  </Button>
                                  <Button>
                                    <Icon type="eye" />
                                    {item.view}
                                  </Button>
                                </Col>
                              </Row>
                            </div>
                          </Card>
                        </List.Item>
                      )}
                    >
                      {this.state.loading && this.state.hasMore && (
                        <div className="demo-loading-container">
                          <Spin />
                        </div>
                      )}
                    </List>
                  ) : (
                    <Empty />
                  )}
                </InfiniteScroll>
              </Skeleton>
            </div>
          </Col>
        </Row>
        <Button className={styles.close} onClick={this.onCancel}>
          <Icon type="close" />
        </Button> 
      </div>
    );
  }
}

function mapStateToProps({ translations }) {
  return { translations };
}

export default connect(
  mapStateToProps
)(Message);