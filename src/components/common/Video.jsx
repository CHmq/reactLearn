import React, { Component } from "react";
import ReactPlayer from "react-player";
import { Typography } from "antd";
class Video extends Component {
  // 设置默认值
  static defaultProps = {
    width: "100%",
    height: "100%",
    title: "", // 标题,
    light: true,
  };
  render() {
    const {
      videosrc,
      title,
      width,
      height,
      light,
      playing,
      onEndEnable,
      setAutoplay,
    } = this.props;
    const { Title } = Typography;
    const styleCss = {
      main: {
        width: "auto",
        height: "auto",
        maxWidth: width,
        maxHeight: height,
        backgroundColor: "transparent",
      },
      text: {
        color: "#fff",
        textAlign: "center",
        width: "100%",
        padding: "0.5rem",
        marginBottom: 0,
      },
      black: {},
    };
    return (
      <div
        className="d-flex"
        style={{ width: "100%", height: "100%", flexDirection: "column" }}
      >
        {title ? (
          <Title level={2} style={styleCss.text}>
            {title}
          </Title>
        ) : (
          ""
        )}
        <ReactPlayer
          className="evi-player"
          url={videosrc || ''}
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
          light={
            light
              ? `${videosrc}?x-oss-process=video/snapshot,t_1000,f_jpg,m_fast`
              : false
          }
          controls
          width="100%"
          height="auto"
          style={styleCss.main}
          playing={typeof playing === 'undefined' || playing}
          onEnded={() => {
            if (onEndEnable) {
              setAutoplay(true);
            }
          }}
        />
        {this.props.children}
      </div>
    );
  }
}

export default Video;
