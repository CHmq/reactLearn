import React from "react";
import { Card } from "antd";

/**
 * 卡片组件
 * @param width 组件宽度 || 200 num
 * @param title 标题 string
 * @param content 主要内容 string
 * @param data 数据 arrary
 * @param childDom 其他元素 ReactDom
 * @export 卡片组件
 * @returns 卡片组件
 */

export default function Achievecard({
  width,
  children,
  relation,
  allTime,
  className,
  name,
  bigname,
  address,
  title,
  number,
  time
}) {
  return (
    <div>
      <Card
        hoverable
        style={{ width: width || 200 }}
        className="card_container"
      >
        {children}
        {relation ? (
          <h2 className="relation">
            <span>親子關係：</span>
            {relation}
          </h2>
        ) : (
          ""
        )}
        {allTime ? <h1 className="allTime">{allTime}分鐘</h1> : ""}
        <div style={{ textAlign: "center" }} className={className}>
          {/* 成就卡片底下文字 */}
          {name ? <h3>{name}</h3> : ""}
          {bigname?<h3 style={{fontSize:'30px',paddingTop:'10px'}}>{bigname}</h3> : ""}
          {address ? <p style={{color:"#9e9e9e"}}>{address}</p> : ""}
          <h3>{title}</h3>
          {number ? <p>{number}次</p> : ""}
          {time ? <p>{time}分鐘</p> : ""}
        </div>
      </Card>
    </div>
  );
}
