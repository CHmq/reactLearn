import React from "react";
import { Icon } from "antd";

/**
 * 生成星星
 *
 * @export 星星个数
 * @param {num} 个数
 * @returns <Icon /> 个数
 */
export default function star(num) {
  let arr = [];
  for (let i = 0; i < num; i++) {
    arr.push(
      <Icon key={i} type="star" theme="filled" style={{ color: "#faad14" }} />
    );
  }
  return arr;
}
