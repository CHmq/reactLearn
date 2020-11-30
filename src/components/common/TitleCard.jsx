import React, { Component } from "react";
import { Col } from "antd";

class TitleCard extends Component {
  render() {
    const { title, titleBgColor, titleColor } = this.props;
    const styles = {
      title: {
        background: titleBgColor,
        color: titleColor,
        height: 70,
        margin: 0,
        textAlign: 'center',
        lineHeight: '70px',
        borderRadius: '20px 20px 0 0',
        fontSize: '35px',
        fontWeight: 'bold',
        boxShadow: '0px 10px 10px -12px #000'
      },
      main: {
        border: '2px solid #f2f2f2',
        borderTop: 'none',
        borderRadius: '0 0 20px 20px'
      }
    }
    return (
      <Col xl={14} lg={18} md={20} xs={22}>
        <h1 style={styles.title}>{title}</h1>
        <div style={styles.main}>
          {this.props.children}
        </div>
      </Col>
    );
  }
}

export default TitleCard;
