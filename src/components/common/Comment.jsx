import React, { Component } from "react";
import {
  Comment,
  List,
  Button,
  Card,
  Icon,
  message,
  Avatar,
  Spin,
  Skeleton
} from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

// import { client } from "components/services/apiService";
import user_commentService from "components/services/user_commentService";
import InfiniteScroll from "react-infinite-scroller";
import Popup from "./Popup";
import PopupMessage from "../PopupMessage";
import Star from "./Star";

import comment from "assets/css/comment.module.scss";
import popupStyle from "assets/css/popup.module.scss";

/**
 * 评论组件 Card + List 实现
 * @param width 组件宽度 || 200 num
 * @param title 标题 string
 * @param data 数据 arrary
 * @param childDom 其他元素 ReactDom
 * @export 评论组件
 * @class MyComment
 * @extends {Component}
 */

class MyComment extends Component {
  constructor() {
    super();
    this.state = {
      // value:[],
      visible: false,
      loading: false, // 加载显示 Antd
      hasMore: true,
      messageData: [], // 处理加载家长留言数据
      needLoading: false, // 是否还要加载 Antd
      setOffset: 0, // 设置offset 默认为0
      // addMessageData: [], // 加载合并后的家长留言数据
      getloading: true, // 能获取数据请求，防止滚动多次进行多次请求
      skeleton: false, // 骨架屏状态
      urlId: "",
      
    };
  }

  componentDidMount() {
    const urlId = this.props.urlId;
    this.GetmessageData(0, 10, urlId);

  }

  // 留言数据获取
  GetmessageData = async (offset = 0, limit = 10, urlId) => {
    // const urlId = this.props.urlId;
    // console.log(offset)
    // console.log(limit)
    // console.log(urlId)
    let dataRows = [];
    try {
      const { rows } = await user_commentService.Comment(offset, limit, urlId);
      dataRows = rows;
    } catch (err) {
      console.log(err + "数据请求加載失敗");
    }
    this.setState({
      messageData: dataRows,
      loading: false
    });
    // 初始化
    if (offset === 0) {
      this.setState({
        addMessageData: dataRows,
        messageData: [], // 防止下面滚动时候出现合并重复第一次加载的数据 
      });
    }
    if(Array.isArray(this.state.addMessageData) && this.state.addMessageData.length){
      // console.log(this.state.addMessageData.length)
      this.setState({skeleton: true})
    }
    
    // console.log('请求的'+this.state.offset)
    // console.log(dataRows)
    // console.log('请求的end')
    // 当请求到dataRows 为 [] 时候就禁止下拉加载
    if (dataRows.length === 0) {
      // 停止下拉加载
      this.setState({
        needLoading: false,
        getloading: false // 不可以滚动加载了
      });
      console.log("停止加载事件开启");
    } else {
      // 加载数据长度不为10条时候继续加载
      this.setState({
        needLoading: true,
        getloading: true // 可以滚动加载了
      });
      console.log("可以滚动");
    }
  };

  // 滚动处理
  handleInfiniteOnLoad = () => {
    let A = this.state.addMessageData; // 目前渲染显示家长留言的数据
    let loadingData = this.state.messageData; // 请求加载获取 家长留言 新的数据
    let can = this.state.getloading; // 是否继续加载请求
    let num = this.state.setOffset; // 滚动次数
    if (can) {
      A = A.concat(loadingData); // 合并
      num += 10; // 加载条数每加载一页新+10
      this.setState({
        loading: true,
        setOffset: num,
        getloading: false,
        addMessageData: A
      });
      // console.log('滚动事件触发')
      // console.log(loadingData)
      // console.log('滚动事件触发end')
      this.GetmessageData(num);
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

  showModal = type => {
    this.setState({
      visible: true,
      type
    });
  };
  //关闭对话框
  onCancel = () => {
    this.setState({
      visible: false
    });
  };

  render() {
    const { width, title, childDom,urlId,Language } = this.props;
    return (
      <Card style={{ width: width || 250 }} className={comment.comment}>
        <Skeleton active loading={title ? false : true}>
          <h2 style={{fontSize: 26, color: '#0f978e', fontWeight: 'bold'}}>{title}</h2>
        </Skeleton>
        <div
          style={{ height: "250px", overflow: "auto" }}
          className={comment.demo_infinite_container}
        >
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={this.handleInfiniteOnLoad}
            hasMore={!this.state.loading && this.state.hasMore}
            useWindow={false}
          >
             {this.state.skeleton ? (
              <List
                // dataSource={this.state.value}
                dataSource={this.state.addMessageData}
                renderItem={item => (
                  <Comment
                    author={item.name}
                    // avatar={item.avatar}
                    avatar={
                      item.avatar || (
                        <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                      )
                    }
                    content={
                      <div>
                        {item.create_time}
                        <br />
                        {Star(item.star)}
                      </div>
                    }
                  >
                    {item.comment}
                  </Comment>
                )}
              >
                {this.state.loading && this.state.hasMore && (
                  <div>
                    <Spin />
                  </div>
                )}
              </List>
            ) : (
              <Skeleton active />
            )}
          </InfiniteScroll>
        </div>

        {childDom || (
          <Button
            onClick={this.showModal}
            type="primary"
            block={true}
            shape="round"
            style={{
              backgroundColor: "#12b6c2",
              borderColor: "#12b6c2",
              marginTop: "25px",
              fontSize: '14px'
            }}
          >
            <Icon type="message" theme="twoTone" />
            {/* 我要留言 */}
            {Language.btnword}
          </Button>
        )}
        <Popup
          visible={this.state.visible}
          onCancel={this.onCancel}
          className={popupStyle.message_popup}
        >
          <PopupMessage
            onCancel={this.onCancel}
            GetmessageData={this.GetmessageData}
            urlId={urlId}
            Language={Language}
          />
        </Popup>
      </Card>
    );
  }
}

function mapStateToProps({ translations }) {
  return { translations };
}

export default connect(
  mapStateToProps
)(MyComment);