import React, { Component } from "react";
import PropTypes from "prop-types";

import Videojs from "video.js";

// 导入videojs 的样式
import "video.js/dist/video-js.css";

import "./style.css";

import "videojs-contrib-quality-levels";
import "videojs-http-source-selector";

// 给window上添加videojs, zh-CN.js 语言注册依赖 videojs.addLanguage()方法
// 配置了不生效的话  把public/index.html  里的标签  <html lang="en">  </html>   lang设置为 "zh-CN"
// window.videojs = Videojs;
// import("video.js/dist/lang/zh-CN.js");

class VideoPlayer extends Component {
  static propTypes = {
    // 视频地址
    src: PropTypes.string,
    // 视频高度
    height: PropTypes.string,
    // 视频宽度
    width: PropTypes.string
  };

  // 默认的props
  static defaultProps = {
    src: "",
    height: '360px',
    width: '640px'
  };

  state = {
    videoId: "custom-video" + +new Date()
  };

  // 初始化内容
  // UNSAFE_componentWillReceiveProps(props) {
  //   try {
  //     const { src } = props;
  //     if (!src || src === this.props.src) return;
  //     this.initVideo(src);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  componentDidMount() {
    this.initVideo(this.props.src);
  }

  componentWillUpdate(prevProps) {
    if(prevProps.src !== this.props.src) {
      this.initVideo(prevProps.src);
    }
  }

  componentWillUnmount() {
    // 销毁播放器
    if (this.player) {
      this.player.dispose();
    }
  }

  // 初始化
  initVideo(src) {
    const { videoId } = this.state;
    const { height, width } = this.props;
    this.player = Videojs(videoId, {
      height,
      width,
      controls: true,
      preload: "auto",
      fluid: true,
      autoplay: true
    });
    this.player.src({ src });
    this.player.httpSourceSelector(); 
  }

  render() {
    const { videoId } = this.state;
    return (
      <div
        className="custom-video-warpper"
        style={{
          display: this.props.src ? "block" : "none"
        }}
      >
        {/* video标签的className一定要是 "video-js",否则样式不生效 */}
        <video id={videoId} className="video-js vjs-default-skin" />
      </div>
    );
  }
}

export default VideoPlayer; 