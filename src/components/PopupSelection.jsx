import React, { Component } from "react";
import { Row, Col, Icon, Skeleton } from "antd";
import styles from "assets/css/PopupSelection.module.scss";
import course_item from "components/services/courseItemService";

/**
 * 选项对话框组件
 * @使用方法: 创建组件<PopupSelection visible={} onCancel={} width={} data={} />
 * @param visible 抽屉显示状态 Boolean
 * @param onCancel 关闭函数 Function 把visible设置为false
 * @param width 宽度 Num 默认为800
 * @param data 选项数据 Array
 * data = [
 *  title: '选择题题目'
 *  pageSize: '页码'
 *  pageActive: '当前页数'
 *  chooseData: [{
 *    chooseNum:'选项'
 *    Answer:'答案的对错 布尔值类型'
 *    img:'图片链接'
 * }]
 */

class AlertlSelection extends Component {
  constructor() {
    super();
    this.state = {
      item: [],
      title: "",
      titleSound: "",
      answer: [],
      skeleton: false 
    };
  }
  async componentDidMount() {
    let id=this.props.id
    const detail = await course_item.get(id).then(ret => {
        return ret.detail;
      })
      .catch(_msg => {
        console.log(_msg);
      });
    const { item } = detail;
    if(item.length > 0){
      this.setState({
        item,
        title: item[0].lang[0].name,
        titleSound: item[0].sound[0].file,
        answer: item[0].answer
      });
    }
  
    if (this.state.item.length > 0) {
      this.setState({ skeleton: true });
    }
  }

  // 声音点击播放
  play = () => {
    this.refs.titleAudio.play();
    console.log("点击播放声音");
  };
  // 选项
  _Choose = (value, e) => {
    let Dom = e.target;
    if (value.Answer) {
      // let node=document.createTextNode(
      //   <p>恭喜你答对了</p>
      // );
      // Dom.appendChild(node)
      console.log(Dom);
      console.log("恭喜你答对了");
      this.setState({
        dispaly: "√"
      });
    } else {
      // let node=document.createTextNode(
      //   <p>答案错误</p>
      // );
      // Dom.appendChild(node)
      this.setState({
        dispaly: "X"
      });
      console.log("答案错误");
    }
    this.refs.answerAudio.play();
  };
  // 下一个
  _next = () => {
    console.log("下一个单元");
  };
  // 确定
  _sure = () => {
    console.log("确定");
  };
  // 关闭
  onCancel = () => {
    this.props.onCancel();
  };
  render() {
    const { data } = this.props;
    // 小圆点标识页码
    let list = (length, active) => {
      let res = [];
      for (let i = 0; i < length; i++) {
        res.push(
          <div
            className={`${styles.SmallDots} ${
              Number(active - 1) === i ? `${styles.active}` : ""
            }`}
            key={i}
          />
        );
      }
      return res;
    };
    return (
      <div className={styles.mainwarp}>
        {/* 标头 */}
        <Row className={styles.herader}>
          <Col xs={0} md={4} className={styles.logo} />
          <Col xs={24} md={20} className={styles.title}>
            <Col md={21} xs={20} className={styles.word}>
              <span>{this.state.title}</span>
            </Col>
            <Col md={3} xs={2}>
              <div className={styles.play} onClick={this.play}>
                <audio ref="titleAudio" src={this.state.titleSound} />
              </div>
            </Col>
          </Col>
          <div className={styles.close} onClick={this.onCancel}>
            <Icon type="close" />
          </div>
        </Row>
        {/* 选择 */}
        <Row gutter={16} type="flex" justify="space-between" align="bottom">
          {this.state.skeleton ? (
            <div>
              {this.state.answer.map((item, id) => {
                return (
                  <Col span={12} key={id}>
                    <div className={styles.choose}>
                      <div
                        className={`${styles.item} ${
                          item.Answer === true
                            ? `${styles.true}`
                            : `${styles.false}`
                        }`}
                        onClick={e => this._Choose(item, e)}
                      >
                        <div className={styles.chooseItem}>{item.name}</div>
                        <img
                          src={item.lang[0].file}
                          style={{ width: "100%" }}
                          alt=""
                        />
                        <audio
                          ref="answerAudio"
                          src=""
                        />
                      </div>
                    </div>
                  </Col>
                );
              })}
            </div>
          ) : (
            <div style={{width:"100%"}}>
              <Col span={12}>
                <Skeleton active avatar/>
              </Col>
              <Col span={12}>
                <Skeleton active avatar/>
              </Col>
              <Col span={12}>
                <Skeleton active avatar/>
              </Col>
              <Col span={12}>
                <Skeleton active avatar/>
              </Col>
            </div>
          )}
        </Row>
        {/* 尾部 */}
        <Row
          type="flex"
          justify="space-between"
          align="bottom"
          className={styles.footer}
        >
          <Col className={styles.page} xs={24} md={14}>
            {this.state.item.length > 1
              ? list(data.pageSize, data.pageActive)
              : ""}
          </Col>
          <Col xs={24} md={10} className={styles.btnwarp}>
            <Col
              xs={11}
              md={{ span: 11, offset: 1 }}
              className={styles.btn}
              onClick={e => this._next()}
            >
              <Icon type="step-forward" />
              下一個單元
            </Col>
            <Col
              xs={11}
              md={{ span: 11, offset: 1 }}
              className={styles.btn}
              offset={1}
              onClick={e => this._sure()}
            >
              <Icon type="check" />
              確定
            </Col>
          </Col>
        </Row>
      </div>
    );
  }
}

export default AlertlSelection;
