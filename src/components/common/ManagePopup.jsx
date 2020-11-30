import React, { Component } from "react";
import { Modal, Row, Col } from "antd";
import "assets/css/ManagePopup.module.scss";


//管理彈出框
class managePopup extends Component {

  render() {
    const { width, visible, title } = this.props;
    return (
        <Modal
          className="manageModal"
          width={'95%'}
          visible={visible}
          onCancel={(e , rest) => {
            if(typeof this.props.onCancel === "function") {
                this.props.onCancel();
            }
            return true;
          }}
          footer={this.props.footer || null}
          style={{maxWidth:`${width}px`}}
          centered={true}
          zIndex={this.props.zIndex || 5}
          maskClosable={this.props.maskClosable}
          destroyOnClose={true}
        >
          <Row className="manage-container">
            <Col>
              <h3 className="title">{title}</h3>
            </Col>
            <Col>
              {this.props.children}
            </Col>
          </Row>
        </Modal>
    );
  }
}

export default managePopup;
