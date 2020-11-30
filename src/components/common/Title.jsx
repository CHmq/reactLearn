import React, { Component } from 'react';
import { Row, Col } from "antd";
import LgIMG from "assets/image/achievement_01.png"
import styleCss from "assets/css/Title.module.scss";
/**
 * @class Title
 * @props logo 圖片
 * @props title 標題
 * @props tip 小標題
 */

class Title extends Component {
  static defaultProps = {
    logo:LgIMG,
    title:'',
    tip:'',
  }
  render() {
  const {logo,title,tip} = this.props
    return (
      <div>
        <Row  type="flex" justify="start">
          <Col xs={3} sm={2} xl={2} className={styleCss.imgWarp}>
            <img src={logo} alt="" width='100%'/>
          </Col>
          <Col xs={21} sm={18} xl={16} className={styleCss.word}>
            <div className={styleCss.title}>{title}&nbsp;&nbsp;&nbsp;&nbsp;<span>{tip}</span></div>
          </Col>
          <Col xs={24} sm={20} xl={14} className={styleCss.right}>
            {this.props.children}
          </Col>
        </Row>
      </div>
    );
  }
}

export default Title;