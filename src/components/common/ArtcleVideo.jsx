import React, { Component } from 'react';
import ReactPlayer from "react-player";
class Video extends Component {
  
  // 设置默认值
  static defaultProps = { 
    width:'100%',
    height:"100%",
    title:'' // 标题
  }
  render() {
    const {videosrc,width,height,marginTop} = this.props;
    const styleCss = {
      main: {
        width: width,
        height: height,
        backgroundColor:'transparent',
        marginTop: marginTop
      }
    };
    return (
      <div type="flex" justify="center" align="middle" style={{width:"100%" , height:"100%", flexDirection: "column"}} >        
        <ReactPlayer className="evi-player" url={videosrc} controls={true} style={styleCss.main} width='auto' height='auto' playing={this.props.playing} />
        {this.props.children}
      </div>
    );
  }
}

export default Video;