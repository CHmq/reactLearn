//新增课程里得探索小活动页面
import React, { Component } from "react";
import { Row, Col, Form, Input, Upload, Button, Icon } from "antd";

const styles = {
  form_container: {
    border: "1px solid #ccc",
    paddingTop: 20,
    borderRadius: 8,
    marginBottom: 10
  },
  button_container: {
    textAlign: "center",
    margin: "100px 0 50px"
  },
  button: {
    background: "#2b4b80",
    borderColor: "#2b4b80",
    margin: "0 10px"
  }
};

class SmallActivity extends Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 18
      }
    };
    return (
      <Row>
        <Col span={24}>
          <Form
            {...formItemLayout}
            onSubmit={this.handleSubmit}
            style={styles.form_container}
          >
            <Form.Item label="專題名稱">
              {getFieldDecorator("name", {
                rules: [{}]
              })(<Input placeholder="請輸入" />)}
            </Form.Item>
            <Form.Item label="專題題目">
              {getFieldDecorator("topic", {
                rules: [{}]
              })(<Input placeholder="請輸入" />)}
            </Form.Item>
            <Form.Item label="封面圖">
              {getFieldDecorator("pic", {
                rules: [{}]
              })(
                <>
                  <Upload accept=".png,.jpg,.gif">
                    <Button>
                      <Icon type="upload" /> 上傳圖片
                    </Button>
                  </Upload>
                  <span>支持檔案：.png, .jpg, .gif</span>
                </>
              )}
            </Form.Item>
            <Form.Item label="音频">
              {getFieldDecorator("pic", {
                rules: [{}]
              })(
                <>
                  <Upload accept=".mps,.wav">
                    <Button>
                      <Icon type="upload" /> 上傳音頻
                    </Button>
                  </Upload>
                  <span>支持檔案：.mp3, .wav</span>
                </>
              )}
            </Form.Item>
          </Form>
        </Col>
        <Col span={24} style={{ textAlign: "center" }}>
          <Button shape="circle" icon="plus" />
        </Col>
        <Col span={24} style={styles.button_container}>
          <Button type="primary" style={styles.button}>取消</Button>
          <Button type="primary" style={styles.button}>下一步</Button>
        </Col>
      </Row>
    );
  }
}

export default Form.create()(SmallActivity);
