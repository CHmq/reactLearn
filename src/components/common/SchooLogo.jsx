/**   
 * <SchooLogo img={'图片链接'} />
 */
import React, { Component } from 'react';
import { Row, Col } from 'antd';
import style from 'assets/css/SchooLogo.module.scss'
// import imgsrc from 'assets/image/logo_s.png'// 导入图片
class SchooLogo extends Component {
  // 设置默认值 
  static defaultProps = { 
    img: '',
  }
  render() {
    const {img} = this.props;
    const styleCss = {
      logowarp:{
        backgroundImage: `url(${img})` ,
      }
    }
    return (
      <div className={ `${img===null?`${style.none}`:''}`}>
        {
          img?(<Row className={`${style.borderbox}`} >
            <Col span={18} offset={4} className={style.borderwarp} ></Col>
          </Row>):''
        }
        <Row>
          <Col span={24} style={styleCss.logowarp} className={style.logowarp}></Col>
        </Row>
      </div>
    );
  }
}

export default SchooLogo;