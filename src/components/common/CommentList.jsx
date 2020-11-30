import React, { Component } from "react";
import { List, message, Avatar, Spin, Comment } from "antd";
import { connect } from "react-redux";
// import intl from "react-intl-universal";
import InfiniteScroll from "react-infinite-scroller";
import articleInfo from "../services/mainService";
import Loading from "components/common/Loading";

import styles from "assets/css/ArticleInfo.module.scss";
/**
 * 评论页面
 */
class CommentList extends Component {
  state = {
    data: [],
    loading: false,
    hasMore: true,
    exploreData: [], // 处理加载数据
    needLoading: false, // 是否还要加载 Antd
    setOffset: 0, // 设置offset 默认为0
    getloading: true, // 能获取数据请求，防止滚动多次进行多次请求
    $$loading: true
  };

  async componentDidMount() {
    this.props.onRef(this);
    let region = this.props.route.currentLocation;
    const {
      params: { article_id: articleID }
    } = this.props.articleID;
    this.setState({
      list: await articleInfo
        .getList(region, articleID, 0, 10)
        .then(ret => {
          console.log(ret);
          this.setState({
            data: ret.rows,
            $$loading: false
          });
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg);
          return [];
        })
    });
  }

  getExploreData = async (offset = 10, limit = 10) => {
    let region = this.props.route.currentLocation;
    const {
      params: { article_id: articleID }
    } = this.props.articleID;
    let dataRows = [];
    this.setState({
      list: await articleInfo
        .getList(region, articleID, offset, limit)
        .then(ret => {
          console.log(ret);
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg);
          return [];
        })
    });
    dataRows = this.state.list.rows;
    this.setState({
      exploreData: dataRows,
      loading: false
    });
    if (dataRows.length === 0) {
      // 加载完毕停止下拉加载
      this.setState({
        needLoading: false,
        getloading: false, // 不可以滚动加载了
        hasMore: false,
        loading: false
      });
      message.warning("沒有新的評論了");
      console.log("停止加载事件开启");
    } else {
      // 加载数据长度不为0条时候继续加载
      this.setState({
        needLoading: true,
        getloading: true, // 可以滚动加载了
      });
    }
  };

  // 滚动处理
  handleInfiniteOnLoad = () => {
    let arr = this.state.data; // 目前渲染的数据
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
      this.getExploreData(num);
    }
  };

  render() {
    const { $$loading } = this.state;
    return (
      !!$$loading ? <Loading /> : (
        <div className={`${styles.demo_infinite_container} list`}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={this.handleInfiniteOnLoad}
            hasMore={!this.state.loading && this.state.hasMore}
            useWindow={false}
          >
            <List
              dataSource={this.state.data}
              renderItem={item => (
                <List.Item key={item.id}>
                  <div className={`${styles.bg} ${styles.commentbg}`}>
                    <Comment
                      avatar={
                        <Avatar
                          src={
                            !!item.img
                              ? item.img
                              : "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                          }
                        />
                      }
                      content={<div>{item.create_time}</div>}
                    >
                      {item.comment}
                    </Comment>
                  </div>
                </List.Item>
              )}
            >
              {this.state.loading && this.state.hasMore && (
                <div className="demo-loading-container">
                  <Spin />
                </div>
              )}
            </List>
          </InfiniteScroll>
        </div>
      )
    );
  }
}
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
    initRoute: payload => dispatch({ type: "initRoute", payload }),
    initUserData: payload => dispatch({ type: "INIT", payload }),
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentList);
