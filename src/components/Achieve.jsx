import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Textfit } from "react-textfit";

import { Progress, Col, Spin } from "antd";
import userLog from "components/services/userLogService";
import user_API from "components/services/userService";

import "assets/css/Achieve.module.scss";

import img from "assets/image/achievement.png";
import img1 from "assets/image/achievement_01.png";
import img2 from "assets/image/achievement_02.png";
import img3 from "assets/image/achievement_03.png";
import img4 from "assets/image/achievement_04.png";

class Achieve extends Component {
  state = {
    list: [],
    spinning: true
  }

  genIMg = (rate) => {
    switch(true) {
      case rate < 50 : return img;
      case rate < 61: return img1;
      case rate > 60 && rate < 81: return img2;
      case rate > 80 && rate < 100: return img3;
      default: return img4;
    } 
  }

  _type = (type, id) => {
    let ret = `achievements/report/detail/${id}`;
    // if(type === 'SCHOOL') ret = `achievements/report/school`;
    // if(id === '4' || id === '6') ret = `achievements/report/detail/${id}`;
    return ret;
  }

  handleClickLink = (item) => {
    localStorage.setItem("AchieveItem", JSON.stringify(item));
  };

  async componentDidMount() {
    //我的成就数据
    let list = [];
    if(user_API.getStatus() === 'VALID'){
      await userLog.chart('DASHBOARD').then(ret => {
        let medal = false;
        ret.forEach(({course_id, file, course_name, count, total, rate, course_type}) => {
          list.push({ course_id, file, title: course_name, picUrl: this.genIMg(rate), url: this._type(course_type, course_id), count, total, rate}); 
          if(rate >= 50) {
            medal = true;
          }
        });
        this.props.callback(medal);
      }).catch(_msg => {
        console.log(_msg);
      }).then(_ret => {
        this.setState({ list,spinning:false });
      });
    }
  }
  render() {
    const { styles, lg, md, sm, xs, url } = this.props;
    return (this.state.list.length ? (
      this.state.list.map((item, index) => (
        <Col lg={lg} md={md} sm={sm} xs={xs} key={index}>
          <Link
            onClick={() => this.handleClickLink(item)}
            to={{
              pathname: `${url}${item.url}`,
            }} 
          >
            <div style={{overflow: 'hidden'}} className={styles}>
              <Textfit
                forceSingleModeWidth={false}
                mode="single"
                min={12}
                max={45}
                style={{
                  width:"100%",
                  height: "23px",
                  margin: "12px 0"                  
                }}
              >
                <h3 title={item.title} style={{width: '90%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '0 auto'}}>
                  <i style={{background: `url(${item.file})no-repeat center`, backgroundSize: 'cover'}}></i>
                  {item.title}
                </h3>
              </Textfit>
              <img src={item.picUrl} alt="" /><br/>
              <span>
                {item.count}/{item.total}
              </span>
              <Progress
                percent={(item.count / item.total) * 100}
                size={"small"}
                showInfo={false}
                strokeColor={"#79bebb"}
              />
            </div>
          </Link>
        </Col>
      ))) : <Spin spinning={this.state.spinning}/>
    );
  }
}


export default (Achieve);
