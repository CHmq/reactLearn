import React, { Component } from "react";
import { Row, Col, Card } from "antd";
import styles from "assets/css/PopupAchieve.module.scss";

export default class PopupAchieve extends Component {
  render() {
    const { text, list } = this.props.data;
    return (
      <Row style={{ background: "none" }} type="flex" justify="center">
        <Col md={24} xs={22}>
          <Card className={styles.container}>
            <img
              className={styles.title}
              src={require("assets/image/AchievePopup.png")}
              alt="title"
            />
            <p>{text}</p>
            {/* <Row>
              {list.map((item, index) => (
                <Col key={index} md={6} offset={6}>
                  <i>
                    <img src={item.iconUrl} alt="" />
                  </i>
                  {item.content}
                </Col>
              ))}
            </Row> */}
            <ul>
              {list.map((item, index) => (
                <li key={index}><i><img src={item.iconUrl} alt=""/></i>{item.content}</li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    );
  }
}
