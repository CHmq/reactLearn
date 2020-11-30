import React, { Component } from "react";
import { Card, List, Button, Skeleton, Icon } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import exploration from "components/services/courseService";
import user_API from "components/services/userService";

import Popup from "./Popup";
import PopupExploration from "../PopupExploration";
import TextEdit from "components/common/TextEdit";

import card from "assets/css/card.module.scss";

/**
 * 卡片组件
 * @param width 组件宽度 || 200 num
 * @param title 标题 string
 * @param content 主要内容 string
 * @param data 数据 arrary
 * @param html 数据 html标签
 * @param childDom 其他元素 ReactDom
 * @export 卡片组件
 * @returns 卡片组件
 */

class MyCard extends Component {
  state = {
    visible: false,
    data: [],
    skeleton: false // 骨架屏状态
  };

  showModal = type => {
    this.getExploreData();
    // console.log(this.state.type);
  };
  //关闭对话框
  onCancel = () => {
    this.setState({
      visible: false
    });
  };

  getExploreData = async (offset = 0, limit = 10, type) => {
    const urlId = this.props.urlId;
    // console.log(urlId)
    this.setState({
      data: await exploration
        .ExploratioList(offset, limit, urlId)
        .then(ret => {
          console.log(ret);
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg + "数据请求加載失敗");
          return [];
        })
    });
    this.setState({
      visible: true,
      type
    });
  };

  render() {
    const { width, title, content, data, html, childDom, urlId , translations } = this.props;
    // const value = this.state.dataRows
    // console.log(this.state.data)
    // 多语言
    const _fn = function(value) {
      return translations.initDone && intl.get('info.content.Card.'+value)
    }
    const Language = {
      Sharebtn:_fn('Sharebtn'),
      backbtn:_fn('backbtn')
    }
    return (
      <Card style={{ width: width || 250 }} className={card.card}>
        {this.props.manage && (
          <TextEdit 
          name={title}
          description={html}
          langInfo={this.props.langInfo}
          URLid={urlId}
          schoolId={this.props.schoolId}
          updateCallback={() => this.props.updateData()}
          >
            <div style={{position: 'absolute', top: 10, right: 10, cursor: 'pointer'}}>
              <Icon type="form" />
            </div>
          </TextEdit>
        )}
        <Skeleton active loading={title ? false : true}>
          <h2 style={{fontSize: 26, color: '#52ccff', fontWeight: 'bold'}}>{title}</h2>
        </Skeleton>
        <p>{content}</p>
        <Skeleton active loading={html ? false : true}>
          {<div dangerouslySetInnerHTML={{ __html: html }} className={card.list_container} /> || (
            <List
              dataSource={data}
              split={false}
              renderItem={(item, index) => (
                <List.Item key={index}>{item}</List.Item>
              )}
            />
          )}
        </Skeleton>
        {childDom || (
          <React.Fragment>
            {/* 其他小朋友专题探索 */}
            <Button
              onClick={this.showModal}
              type="primary"
              icon="share-alt"
              shape="round"
              block={true}
              style={{
                marginBottom: 10,
                backgroundColor: "#ff9d52",
                borderColor: "#ff9d52",
                fontSize: "14px",
                display: "none"
              }}
            >
              {Language.Sharebtn}
            </Button>
            <br />
              <Button
                type="primary"
                icon="rollback"
                shape="round"
                block={true}
                style={{ backgroundColor: "#52ccff", borderColor: "#52ccff", fontSize: '14px' }}
                onClick={this.props.route.history.goBack}
              >
                {Language.backbtn}
              </Button>
            <Popup onCancel={this.onCancel} visible={this.state.visible}>
              <PopupExploration
                onCancel={this.onCancel}
                data={this.state.data}
                urlId={urlId}
              />
            </Popup>
          </React.Fragment>
        )}
      </Card>
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

export default connect(mapStateToProps)(MyCard);

// export default MyCard;
