import React, { Component } from "react";
import { Modal } from "antd";

import "assets/css/popup.module.scss";

/**
 * 对话框组件
 * @使用方法:创建组件
 * <Popup width={} visible={} onCancel={} img={} childDom={} />
 * @param width 宽度 Num 默认为800
 * @param visible 状态 Boolean
 * @param onCancel 关闭函数 Function 把visible设置为false
 * @param img 左侧图片路径 String
 * @param childDom 子节点 ReactDom
 */

export default class Popup extends Component {
  //关闭对话框;
  onCancel = () => {
    this.props.onCancel();
  };

  render() {
    const { width, visible , bodyStyle , style , zIndex } = this.props;
    return (
      <Modal
        className="message_popup"
        width={width || 755}
        visible={visible}
        centered={true}
        footer={null}
        bodyStyle={{  ...bodyStyle , padding: 0 }}
        closable={false}
        maskClosable={true}
        destroyOnClose
        onCancel={this.onCancel}
        zIndex={zIndex || 2000}
        style={!!style ? { backgroundColor : "transparent" , ...style } : style}
      >
        {this.props.children}
      </Modal>
    );
  }
}
