import React, { Component } from "react";
import list from "assets/css/memulist.module.scss";
import { Textfit } from "react-textfit";

export default class Resource extends Component {
  // 设置默认值
  static defaultProps = {
    picUrl: "", // 图片链接
    title: "", // 标题
    date: "", // 日期
    set: false, // 設置
    MemMargin: "auto", // 设置这个组件外边距
    titleBgcolor: null, // 設置title背景顔色
    titleColor: "#fff", // 設置title 字體顔色
    titleRadius: "auto", // 設置title 的圓角
    titleFontSize: "1rem", // 設置title 的字體大小
    titlePadding: "2px 5px", // 設置title 的内邊距
    titleAlign: "left", //设置title的对齐方式
    borderRadius: "auto" // 設置整個圓角
  };

  genBackground = (index = 0) => {
    let mapping = ["#92d9f8", "#ff8ea6", "#fff4de", "#c7ff72", "#bd9cff"];
    return mapping[index % mapping.length];
  };
  // 调用父组件方法
  // Deletails=()=>{
  //   this.props.openDeletails();
  // }
  render() {
    const {
      onClick,
      picUrl,
      title,
      MemMargin,
      titleColor,
      titleBgcolor,
      titleRadius,
      titleFontSize,
      titlePadding,
      titleAlign,
      borderRadius,
      index,
      multi
    } = this.props;
    const styleCss = {
      container: {
        backgroundImage: `url(${picUrl})`,
        backgroundSize: "cover",
        // background-size: cover;
        backgroundPosition: "center",
        borderRadius: borderRadius,
        margin: MemMargin,
//        height: "180px",
        width: "100%",
        paddingBottom: "100%",
        color: titleColor
      },
      title: {
        background: "rgba(0, 0, 0, 0.5)",
        borderRadius: titleRadius,
        fontSize: titleFontSize,
        color: titleColor,
        padding: titlePadding,
        textAlign: titleAlign
      }
    };
    return (
      <div
        className={list.container}
        style={{
          ...styleCss.container,
          ...{
            padding: !picUrl ? "5%" : "auto",
            backgroundColor: !!picUrl
              ? "transparent"
              : titleBgcolor || this.genBackground(index)
          }
        }}
        onClick={onClick}
      >
        {!picUrl ? (
          <Textfit
            forceSingleModeWidth={false}
            mode={
              !!multi ||
              !!/^[a-zA-Z~!@#$%^&*()_+[\]\\{}|;':",./<>?`\w\d\s]+$/.test(title)
                ? "multi"
                : "single"
            }
            min={1}
            max={45}
            style={{
              alignItems: "center",
              justifyContent: "center",
              position : "absolute",
              top: "5%",
              left: "5%",
              right: "5%",
              bottom: "5%"
            }}
            className={"d-inline-flex"}
          >
            {title}
          </Textfit>
        ) : (
          ""
        )}
        {!!picUrl && !!title ? (
          <h5 className={list.itemtitle} style={styleCss.title} title={title}>
            {title}
          </h5>
        ) : (
          ""
        )}
      </div>
    );
  }
}
