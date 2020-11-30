import React, { Component } from 'react';
import closeImg from "assets/image/close.png"

/**
 *
 * @props bgimg 圖片背景
 * @props state 是否顯示圖片 true 为不显示 flase 是显示 默认为true
 * @props Img 图片
 * @props height 这个组件的高度 默认 100%
 * @props width 这个组件的宽度 默认 100%
 * @class ImgCard 
 * @extends {Component}
 */
class ImgCard extends Component {
  static defaultProps = {
    bgimg:'',
    Img:closeImg,
    state:true,
    height:'100%',
    width:'100%'
  }
  render() {
    const {bgimg,state,Img,height,width} = this.props;
    const style = {
      warp:{
        border:' 2px solid #fff',
        boxShadow: 'rgb(234, 234, 234) 1px 3px 1px 0px',
        backgroundRepeat:' no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `url(${bgimg})` ,
        height:height,
        width:width,
      }
    }
    return (
      <div>
        <div style={style.warp}>
          { 
            state?'':<img src={Img} alt="" style={{width:'100%'}}/>
          } 
        </div>
      </div>
    );
  }
}

export default ImgCard;