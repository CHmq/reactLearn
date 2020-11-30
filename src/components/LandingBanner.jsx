/*
 * @使用方法:创建组件<Banner img={'图片路径'} height={'默认为400px'} heightauto={默认为false }> 
 */

import React, { Component } from 'react';
import { Icon, Carousel } from 'antd';

import logoutStyle from "assets/css/logout.module.scss";
export default class LogoutBanner extends Component {
  // 设置默认值 
  // static defaultProps = { 
  //   height: '400px',
  //   index:'',
  //   heightauto:false // 高度为自适应 当max-width: 991px时候使用的类名
  // }
  
  handlePrev = () => {
    this.refs.img.prev(); //ref = img
  };
  handleNext = () => {
    this.refs.img.next();
  };
  render() {
    // const {img,height,heightauto} = this.props;
    // const styleCss = {
    //   main : {
    //     height: height,
    //     backgroundImage: `url(${img})` ,
    //   },
    // }
    return (
      <div style={{ position: "relative" }}>
            {/* 上一頁按鈕 */}
            <Icon
              type="left"
              theme="outlined"
              onClick={this.handlePrev}
              style={{ left: 0 }}
              className={logoutStyle.Icon}
            />

            {/* 輪播 */}
            <Carousel autoplay ref="img">
              {/* 輪播内容 */}
              {this.props.img.map((item, index) => (
                <div key={index} className={logoutStyle.banner}>
                    {!!item.link ? <a href={item.link} target="_blank" rel="noopener noreferrer"><img src={item.file} className={logoutStyle.bg} alt="" /></a> : <img src={item.file} className={logoutStyle.bg} alt="" />}
                </div>
              ))}
              {/* <div className={logoutStyle.banner}>
                <img src={require("assets/image/bg1.jpg")} className={logoutStyle.bg} alt="" />
                <div
                  className={
                    logoutStyle.contentBanner + " " + logoutStyle.contentLeft
                  }
                >
                  <h3>Best Children Kindergarten</h3>
                  <h1>
                    <span>Kinder</span> Garten
                  </h1>
                  <p>
                    We provides always our best industrial solution for our
                    clients <br />
                    and always try to achieve our client's trust and
                    satisfaction.
                  </p>
                  <Button className={logoutStyle.btnBanner}>Contact Us</Button>
                </div>
              </div>
              <div className={logoutStyle.banner}>
                <img src={require("assets/image/bg3.jpg")} className={logoutStyle.bg} alt="" />
                <div
                  className={
                    logoutStyle.contentBanner + " " + logoutStyle.contentRight
                  }
                >
                  <h3>Best Children Kindergarten</h3>
                  <h1>
                    <span>Kinder</span> Garten
                  </h1>
                  <p>
                    We provides always our best industrial solution for our
                    clients <br />
                    and always try to achieve our client's trust and
                    satisfaction.
                  </p>
                  <Button className={logoutStyle.btnBanner}>Contact Us</Button>
                </div>
              </div> */}
            </Carousel>
            {/* 下一頁按鈕 */}
            <Icon
              type="right"
              theme="outlined"
              style={{ right: 0 }}
              className={logoutStyle.Icon}
              onClick={this.handleNext}
            />
          </div>
    );
  }
}