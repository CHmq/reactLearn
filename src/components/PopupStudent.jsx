import React, { Component } from 'react';
import { Modal, Row, Col, Button } from 'antd';
import { connect } from "react-redux";
import intl from "react-intl-universal";

import userJoinLog from "components/services/userJoinLogService";
import "assets/css/PopupStudent.module.scss";
import img from 'assets/image/MaskGroup23.png';


class PopupStudent extends Component {
  handleClickBtn = async (YandN) => {
    this.props.onClose();
    await userJoinLog.add(YandN).then((ret)=>{      
    }).catch((_msg)=>{
      console.log(_msg);
    });
  }

  render() {
    const { visible, onClose , translations} = this.props;
    const _lang = function(value) {
      return translations.initDone && intl.get(`general.` + value);
    };
    return (
      <Modal
        width={600}
        visible={visible}
        onCancel={() => onClose()}
        footer={null}
        closable={false}
        centered={true}
        maskClosable={false}
        bodyStyle={{padding: 0}}
        style={{borderRadius: 20}}
        className='popupStudent_wrap'
      >
        <Row style={{textAlign: 'center'}}>
          <Col span={24}>
            <h1 style={{lineHeight: '60px', margin: 0}}>{ _lang(`msg.is_parent_join`) }</h1>
          </Col>
          <Col span={12} style={{padding: '20px 40px', background: '#bfddff'}}>
            <img src={img} style={{width: '100%'}} alt=''/> <br />
            <Button onClick={()=>this.handleClickBtn("Y")} className='button'>{ _lang(`button.yes`)}</Button>
          </Col>
          <Col span={12} style={{padding: '20px 40px', background: '#ddffd1'}}>
            <img src={require("assets/image/Group 9001.png")} style={{width: '100%'}} alt=''/> <br />
            <Button onClick={()=>this.handleClickBtn("N")} className='button redButton'>{ _lang(`button.no`)}</Button>
          </Col>
        </Row>
      </Modal>
    );
  }
}

function mapStateToProps({ route, user, auth, translations }) {
  return {
    route,
    user,
    auth,
    translations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopupStudent);