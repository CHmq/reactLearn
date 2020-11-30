import React, { Component } from "react";
import { Card, Rate, Input, Button, Icon, Row, Col, message } from "antd";
import "assets/css/PopupMessage.module.scss";
// import { client } from "./services/apiService";
// import cookie from "./utils/cookie";
import user_commentService from "./services/user_commentService";

const { TextArea } = Input;
export default class Message extends Component {
  constructor() {
    super();
    this.state = {
      comment: ["課程内容充實", "課程内容很有趣", "課程内容很有教育意義"],
      starNum: 5, // 星星 默认为5个
      textareaValue: "" // 文本内容
    };
  }

  // 關閉事件
  onCancel = () => {
    this.props.onCancel();
  };
  // 提交事件
  async _submit() {
    if (this.state.textareaValue.length === 0) {
      message.error("請填寫評論語");
      return false;
    }
    // const urlAarry = window.location.pathname.split("/").filter(i => i); // 获取url 拆成数组
    // const urlId = urlAarry[urlAarry.length - 1]; // 获取url 最后一个 就是id的值
    console.log(this.props.urlId)
    // const courseID = this.props.match.params.course_id || undefined;
    const urlId = this.props.urlId;

    await user_commentService.PopupMessageAdd(
      urlId,
      this.state.textareaValue,
      this.state.starNum
    ).then(ret=>{
      console.log(ret)
      message.success("評論成功");
      this.setState({
        textareaValue: ""
      });
      this.onCancel()
      this.props.GetmessageData(0,10,urlId) // 0就是加载第一页
    }).catch( _msg =>{
      //SHOW MESSAGE
      message.error("error");
      console.log(_msg);
    })

  }
  // 获取星星的值
  _rate = value => {
    this.setState({
      starNum: value
    });
  };
  // text
  _text = value => {
    console.log(value);
  };
  //设置textareaValue
  handleTextareaChange(e) {
    this.setState({
      textareaValue: e.target.value
    });
  }

  render() {
    const {Language} = this.props
    return (
      <div className="message_wrap">
        <Row>
          <Col xs={0} md={9}>
            <img
              style={{ width: "100%" }}
              src={require("assets/image/message.png")}
              alt=""
            />
          </Col>
          <Col xs={24} md={0}>
            <div className="xs_title">
              <h2>{Language.title}:</h2>
            </div>
          </Col>
          <Col xs={24} md={15}>
            <Card
              className="message_container"
              bordered={false}
              bodyStyle={{ padding: "35px 50px 35px 50px" }}
            >
              <h3>{Language.tiptitle}:</h3>
              {/*allowClear={false} 不允許全部清空  defaultValue={5} 開始默認值為5 */}
              <Rate
                allowClear={false}
                defaultValue={5}
                onChange={value => {
                  this._rate(value);
                }}
              />
              <TextArea
                autosize={true}
                value={this.state.textareaValue}
                onChangeCapture={this.handleTextareaChange.bind(this)}
              />
              <h3>{Language.commentsword}</h3>
              <ul>
                {this.state.comment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <Button
                className="xs_submit"
                type="submit"
                block
                onClick={e => this._submit()}
              >
                {Language.Submitbtn}
              </Button>
            </Card>
          </Col>
        </Row>
        <Button
          className="submit"
          type="submit"
          onClick={e => this._submit()}
        />
        <Button className="close" onClick={this.onCancel}>
          <Icon type="close" />
        </Button>
      </div>
    );
  }
}
