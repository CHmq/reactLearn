/*
 * @使用方法:创建组件<Banner img={'图片路径'} height={'默认为400px'} heightauto={默认为false }>
 */

import React, { Component } from "react";
import Slider from "react-slick";
import "../../node_modules/slick-carousel/slick/slick.css";
import "../../node_modules/slick-carousel/slick/slick-theme.css";
import "../assets/css/SlickCarousel.scss";

import course1 from "../assets/image/jt1.png";
import course2 from "../assets/image/jt2.png";
import course3 from "../assets/image/jt3.png";
import course4 from "../assets/image/jt4.png";
import course5 from "../assets/image/jt5.png";
import course6 from "../assets/image/jt6.png";
import course7 from "../assets/image/jt7.png";
import course8 from "../assets/image/jt8.png";
import course9 from "../assets/image/jt9.png";
import course10 from "../assets/image/jt10.png";

import explore1 from "../assets/image/landing/explore_01.jpg";
import explore2 from "../assets/image/landing/explore_02.jpg";
import explore3 from "../assets/image/landing/explore_03.jpg";
import explore4 from "../assets/image/landing/explore_04.jpg";
import explore5 from "../assets/image/landing/explore_05.jpg";

import LandingPopup from "./LandingPopup";

class SlickCarousel extends Component {
  $$landing = null;
  state = {
    data: [],
    settings: {}
  };

  componentDidMount = () => {
    this.$$landing = React.createRef();
  };

  componentWillMount() {
    const a = document.documentElement.clientWidth;
    //Slider屬性
    if (a > 768) {
      this.setState({
        settings: {
          dots: true, //圓點
          infinite: true,
          slidesToShow: 4, //一行顯示數量
          slidesToScroll: 1
        }
      });
    } else {
      this.setState({
        settings: {
          dots: true, //圓點
          infinite: true,
          slidesToShow: 3, //一行顯示數量
          slidesToScroll: 1
        }
      });
    }
  }

  //彈出框
  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
  };

  render() {
    const data1 = [
      {
        id: "0",
        image: course1,
        title: "交通"
      },
      {
        id: "1",
        image: course2,
        title: "動物"
      },
      {
        id: "2",
        image: course3,
        title: "大自然"
      },
      {
        id: "3",
        image: course4,
        title: "社區"
      },
      {
        id: "4",
        image: course5,
        title: "健康與衛生"
      },
      {
        id: "5",
        image: course6,
        title: "學校"
      },
      {
        id: "6",
        image: course7,
        title: "環保"
      },
      {
        id: "7",
        image: course8,
        title: "食物"
      },
      {
        id: "8",
        image: course9,
        title: "個人與家庭"
      },
      {
        id: "9",
        image: course10,
        title: "幫助我們的人"
      }
    ];
    const data2 = [
      {
        id: "0",
        image: explore1,
        title: "探索"
      },
      {
        id: "1",
        image: explore2,
        title: "探索"
      },
      {
        id: "2",
        image: explore3,
        title: "探索"
      },
      {
        id: "3",
        image: explore4,
        title: "探索"
      },
      {
        id: "4",
        image: explore5,
        title: "探索"
      }
    ];

    const { type } = this.props;
    if (type === "course") {
      this.state.data = data1;
    } else {
      this.state.data = data2;
    }

    const Modalstyle = {
      background: "#fff",
      padding: "15px 20px",
      borderRadius: "3%"
    };

    return (
      <div>
        <Slider {...this.state.settings} className="SlickCarousel">
          {this.state.data.map((item, index) => {
            return (
              <div key={index}>
                {type === "course" ? (
                  <div
                    onClick={
                      !!this.$$landing
                        ? () => {
                            this.$$landing.current.showModal();
                          }
                        : void 0
                    }
                    style={{ padding: "0 10px" }}
                  >
                    <div className="slick_img">
                      <img src={item.image} alt="" />
                    </div>
                    <h3>{item.title}</h3>
                  </div>
                ) : (
                  <div
                    onClick={
                      !!this.$$landing
                        ? () => {
                            // this.$$landing.current.showModal();
                          }
                        : void 0
                    }
                  >
                    <div className="slick_img">
                      <div className="slick_img1">
                        <img src={item.image} alt="" />
                      </div>
                    </div>
                    <h3>{item.title}</h3>
                  </div>
                )}
              </div>
            );
          })}
        </Slider>
        <LandingPopup
          ref={this.$$landing}
          type={"login"}
          width="400px"
          closable={false}
          Modalstyle={Modalstyle}
          style={{ display: "none" }}
        />
      </div>
    );
  }
}
export default SlickCarousel;
