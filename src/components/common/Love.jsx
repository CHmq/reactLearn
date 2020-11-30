import React, { Component } from 'react';
import styleCss from 'assets/css/Love.module.scss'
/**
 *
 *
 * @class Love
 * @props width 宽度
 * @props height 高度
 * @extends {Component}
 */
class Love extends Component {
  static defaultProps = {
    height:'40px',
    width:'40px',
    active:false
  }
  render() {
    const {width,height,active} = this.props;
    const style = {
      main:{
        height:height,
        width:width
      }
    }
    return (
      <div style={style.main} className={`${styleCss.lovewarp} ${active?`${styleCss.active}`:''}`}>
      </div>
    );
  }
}

export default Love;