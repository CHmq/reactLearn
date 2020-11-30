/*
 * @使用方法: 创建组件<Breadcrumbs/>，在breadcrumbName添加导航的名称以及路径
 */

import React, { Component } from "react";
import { withRouter, Link } from "react-router-dom";
import { Breadcrumb } from "antd";

class Breadcrumbs extends Component {
  constructor() {
    super();
    this.state = {
      extraBreadcrumbItems: null,
      breadcrumbName: [
        {
          title: "生活知識",
          pathName: "course"
        },
        {
          title: "交通",
          pathName: "info"
        },
        {
          title: "我的成就",
          pathName: "achievements"
        }
      ]
    };
  }
  getPath() {
    const locationUrl = this.props.location.pathname;// 获取url路径 例如/cn/en/course
    //对路径进行切分，存放到pathSnippets中 例如/cn/en/course 转为 ["cn", "en", "course"]
    const pathSnippets = this.props.match.url.split("/").filter(i => i);
    //判斷是否為翻譯版本
    const fristurlArray = locationUrl.split("/").filter(i => i);
    if (fristurlArray.length === 2) {
      // 删除前面数组["cn","en"] 保留为['course']
      pathSnippets.splice(0, 2);
      
      // 將locationUrl重新插入數組
      pathSnippets.splice(0, 0, fristurlArray.join("/"));
    }


    this.setState({
      extraBreadcrumbItems: pathSnippets.map((value, index) => {
        // 遍历breadcrumbName数组获取对应名称title，并存储
        let currentObj = this.state.breadcrumbName.find(
          item => item.pathName === value
        );
        const title = currentObj ? currentObj.title : "首页";
        //判断是否是最后一个路径
        const last = pathSnippets.indexOf(value) === pathSnippets.length - 1;

        //重新拼接url
        const url = `/${pathSnippets
          .slice(0, index + 1)
          .join("/")}`;
        return last ? (
          <Breadcrumb.Item key={index}>{title}</Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key={index}>
            <Link to={url}>{title}</Link>
          </Breadcrumb.Item>
        );
      })
    });
  }

  componentDidMount() {
    //首次加载的时候调用，形成面包屑
    this.getPath();
  }
  componentWillReceiveProps() {
    //任何子页面发生改变，均可调用，完成路径切分以及形成面包屑
    this.getPath();
  }
  render() {
    return (
      <span>
        <Breadcrumb separator=">" style={{ margin: "12px 0" }}>
          {this.state.extraBreadcrumbItems}
        </Breadcrumb>
      </span>
    );
  }
}
export default withRouter(Breadcrumbs);
