/*
 * @使用方法:创建组件<Banner img={'图片路径'} height={'默认为400px'} heightauto={默认为false }>
 */

import React, { Component } from "react";
import { Icon, Menu } from "antd";

import logoutStyle from "assets/css/logout.module.scss";

const SubMenu = Menu.SubMenu;
export default class LogoutMenu extends Component {
  state = { current: "mail" };
  // 设置默认值
  // static defaultProps = {

  // }

  //菜單
  handleClick = e => {
    console.log("click ", e);
    this.setState({
      current: e.key
    });
  };

  render() {
    // const {img,height,heightauto} = this.props;

    return (
      <Menu
        className={logoutStyle.menu}
        onClick={this.handleClick}
        selectedKeys={[this.state.current]}
        mode="horizontal"
      >
        {/* 菜單 */}
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              <Icon type="setting" />
              Shortcodes
            </span>
          }
        >
          <Menu.Item key="5">Option 5</Menu.Item>
          <Menu.Item key="6">Option 6</Menu.Item>
          <SubMenu key="sub3" title="Submenu">
            <Menu.Item key="7">Option 7</Menu.Item>
            <Menu.Item key="8">Option 8</Menu.Item>
          </SubMenu>
        </SubMenu>
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              <Icon type="setting" />
              Courses
            </span>
          }
        >
          <Menu.Item key="5">Option 5</Menu.Item>
          <Menu.Item key="6">Option 6</Menu.Item>
          <SubMenu key="sub3" title="Submenu">
            <Menu.Item key="7">Option 7</Menu.Item>
            <Menu.Item key="8">Option 8</Menu.Item>
          </SubMenu>
        </SubMenu>
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              <Icon type="setting" />
              Features Pages
            </span>
          }
        >
          <Menu.Item key="5">Option 5</Menu.Item>
          <Menu.Item key="6">Option 6</Menu.Item>
          <SubMenu key="sub3" title="Submenu">
            <Menu.Item key="7">Option 7</Menu.Item>
            <Menu.Item key="8">Option 8</Menu.Item>
          </SubMenu>
        </SubMenu>
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              <Icon type="setting" />
              Home
            </span>
          }
        >
          <Menu.Item key="1">Option 1</Menu.Item>
          <Menu.Item key="2">Option 2</Menu.Item>
          <SubMenu key="3" title="Option 3">
            <Menu.Item key="31">Option 31</Menu.Item>
            <Menu.Item key="32">Option 32</Menu.Item>
          </SubMenu>
          <SubMenu key="4" title="Option 4">
            <Menu.Item key="41">Option 41</Menu.Item>
            <Menu.Item key="42">Option 42</Menu.Item>
          </SubMenu>
          <Menu.Item key="5">Option 5</Menu.Item>
          <SubMenu key="6" title="Option 6">
            <Menu.Item key="61">Option 61</Menu.Item>
            <Menu.Item key="62">Option 62</Menu.Item>
          </SubMenu>
        </SubMenu>
      </Menu>
    );
  }
}
