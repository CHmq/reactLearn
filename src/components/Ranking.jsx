import React, { Component } from 'react';

import Breadcrumbs from "components/common/Breadcrumbs";
import { Row, Col,List,Avatar } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import styleCss from 'assets/css/Ranking.module.scss'
// import layoutStyle from "assets/css/layout.module.scss";

import imgTitle from "assets/image/rankt.png"
import BGIMG from "assets/image/bg.png"
import imgBg from "assets/image/rankb.png"
/**   
 * page name:龙虎榜
 * 
 * */ 
class Ranking extends Component {
  state = {
    backgroundIMG:BGIMG,// 页面背景图
    listData:[{
      PositionNum:1,
      avatarIMG:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      name:'菲菲',
      word:'Evi幼儿园',
      Scores:1000
    },{
      PositionNum:1,
      avatarIMG:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      name:'菲菲',
      word:'Evi幼儿园',
      Scores:1000
    },{
      PositionNum:1,
      avatarIMG:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      name:'菲菲',
      word:'Evi幼儿园',
      Scores:1000
    },{
      PositionNum:1,
      avatarIMG:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      name:'菲菲',
      word:'Evi幼儿园',
      Scores:1000
    },{
      PositionNum:1,
      avatarIMG:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      name:'菲菲',
      word:'Evi幼儿园',
      Scores:1000
    },{
      PositionNum:1,
      avatarIMG:'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      name:'菲菲',
      word:'Evi幼儿园',
      Scores:1000
    }]
  }

  async componentDidMount()  {
    const { updateFileName } = this.props;
    updateFileName("home");
  }

  render() {
    const { locationUrl,translations } = this.props;
    // const { Header, Footer } = Layout;
    const style = {
      background: {
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#fff",
        backgroundImage: `url(${this.state.backgroundIMG})`
      },
      titleImg : {
        backgroundImage: `url(${imgTitle})` ,
      },
      Rank: {
        backgroundImage: `url(${imgBg})` ,
      }
    }
    // 多语言
    const _fn = function(value) {
      return translations.initDone && intl.get("ranking.content."+value)
    }
    const Language = {
      btnrules: _fn("btnrules"),
      time:_fn("time"),
    }
    console.log(Language)
    return (
        <Row>
          <Row 
            type="flex"
            justify="space-around"
            style={{ paddingBottom: 60 }}
            className={styleCss.rankWarp}
          >
            <Col xs={22} md={20} lg={14}>
              {/* 面包屑 */}
              <Breadcrumbs locationUrl={locationUrl} />
              {/* 主体 */}
              <div className={styleCss.container}>
                  {/* 标题 */}
                  <Col className={`${styleCss.title} ${styleCss.bgimg}`} style={style.titleImg}>
                     <Col span={24} style={{paddingBottom:'10px'}}>
                      <h1 className={`${styleCss.cWhite} ${styleCss.word}`}>6月會員龍虎榜</h1>
                     </Col>
                     <Col span={24} >
                       <Col xs={15} sm={20} className={`${styleCss.cWhite} ${styleCss.timedata}`}><span>{Language.time}:</span>2019-06-05</Col>
                       <Col xs={9} sm={4} className={`${styleCss.ruler}`}>
                         <div>{Language.btnrules}</div>
                       </Col>
                     </Col>
                  </Col>
                  {/* 前三名 */}
                  <Col style={style.Rank} className={`${styleCss.bgimg} ${styleCss.Rankwarp}`}>
                    <Row type="flex" justify="center" align="bottom" style={{height:'100%'}}>
                      <Col lg={11} md={11} xs={23} className={styleCss.warp}>
                        <div className={`${styleCss.Podium}`}>
                          <Col span={22} className={`${styleCss.two}`}>
                            <Avatar className={styleCss.avatar} src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                          </Col>
                        </div>
                        <div className={`${styleCss.Podium}`}>
                          <Col span={22} className={`${styleCss.one}`}>
                            <Avatar className={styleCss.avatar} src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                          </Col>
                        </div>
                        <div className={`${styleCss.third} ${styleCss.Podium}`}>
                          <Col span={22} className={`${styleCss.third}`}>
                            <Avatar className={styleCss.avatar} src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                          </Col>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  {/* 列表内容 */}
                  <Col>
                  {
                    this.state.listData.map((item,index)=> {
                      return (
                        <List className={styleCss.itemwarp} key={index}>
                          <List.Item style={{borderRadius:'10px'}} className={styleCss.item}>
                          <Col span={4} className={styleCss.sort}>
                            {item.PositionNum}
                          </Col>
                          <List.Item.Meta
                              className={styleCss.main}
                              avatar={
                                <Avatar src={item.avatarIMG} className={styleCss.avatarwarp} />
                              }
                              title={item.name}
                              description={item.word}
                            />
                            <Col span={5} className={styleCss.number}>{item.Scores}</Col>
                          </List.Item>
                          
                        </List>
                      )
                    })
                  }
                    {/* <List className={styleCss.itemwarp}>
                       <List.Item style={{borderRadius:'10px'}} className={styleCss.item}>
                       <Col span={4} className={styleCss.sort}>
                         1
                       </Col>
                       <List.Item.Meta
                          className={styleCss.main}
                          avatar={
                            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                          }
                          title={'菲菲'}
                          description={'Evi幼儿园'}
                        />
                        <Col span={5} className={styleCss.number}>1000</Col>
                       </List.Item>
                      
                    </List> */}

                  </Col>
              </div>

            </Col>

          </Row>
        </Row>
    );
  }
}


function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations
  };
}

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Ranking);
