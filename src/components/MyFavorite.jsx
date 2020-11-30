import React, { Component } from 'react';
import { Row, Col, Spin, Icon, Empty } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
// import InfiniteScroll from "react-infinite-scroller";
import Resource from "components/course/Resource";
import TitleCard from "components/common/TitleCard";
import Adapter from "components/resource/Adapter";
import service from "components/services/user_favourite";

//我的最愛頁面

import bgPic from 'assets/image/bg.png'

const styles={
  star: {
    color: 'gold', 
    position: 'absolute',
    right: 0, 
    bottom: -1,
    cursor: 'pointer',
    padding: 5,
    zIndex: 1,
  }
}

class MyFavorite extends Component {
  state = {
    listData: [],
    loading: false
  }
  async componentDidMount() {
    this.getList();
    const {
      updateFileName,
      match,
      updateRoute,
      $rootURL,
      $language: currentLanuage
    } = this.props;
    updateFileName("home");
    updateRoute({ currentLanuage, realUrl: match.url.replace($rootURL, "") });
  }
  //获取数据
  async getList() {
    await service.getList().then(ret => {
      this.setState({
        listData: ret.rows,
        loading: true
      });
    }).catch(_msg => {
      console.log(_msg);
    })
  }
  //delete
  async handleClickStar(item, e) {
    e.preventDefault();
    await service.starDelete(item.res_id).then(ret => {
      console.log(ret)
      this.getList();
    }).catch(_msg => {
      console.log(_msg);
    })
  }
  render() {
    const { translations } = this.props;
    return (
      <div className='history_container' style={{ backgroundColor: "#fff" }}>
        <Row style={{padding: '30px 0', background: `url(${bgPic})`}} type='flex' justify='center'>
          <TitleCard 
          title={translations.initDone &&
            intl.get("myFavorite.content.title")}
          titleBgColor='#ff92a1'
          titleColor='#fff'
          >
            <Row gutter={40} style={{padding: '20px 45px', height: 420}}>
              {this.state.loading && this.state.listData.length ? 
                this.state.listData.map((item) => (
                  <Col key={item.ref_id} lg={6} md={8} sm={12} xs={24} style={{marginBottom: 20}}>
                    <Adapter item={item} res_type={item.type} id={item.res_id} nWindow={true}>
                      <Resource 
                      picUrl={item.file} 
                      title={item.name}
                      titleFontSize='12px'
                      titlePadding='6px 20px 6px 10px'
                      />
                      <div style={styles.star} onClick={this.handleClickStar.bind(this, item)}>
                        <Icon type='star' theme="filled" />
                      </div>
                    </Adapter>
                  </Col>
                ))
                :
                <div style={{height: 420, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  {this.state.loading ? <Empty /> : <Spin size='large' tip='Loading...' />}
                </div>
              }
            </Row>
          </TitleCard>
        </Row>
      </div>
    );
  }
}

/** redux 獲得全局數據
 * route  route data (url, language)
 * user  user data (用戶數據)
 */
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
    updateRoute: payload => dispatch({ type: "updateRoute", payload }),
    initUrl: payload => dispatch({ type: "initUrl", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyFavorite);