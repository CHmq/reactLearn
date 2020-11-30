import React, { Component } from "react";
import { Row, Col, Empty, message, Skeleton } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import InfiniteScroll from "react-infinite-scroller";

import Adapter from "components/resource/Adapter";
// import Video from "components/common/Video";
import Resource from "components/course/Resource";
import TitleCard from "components/common/TitleCard";
import userLog from "components/services/userLogService";

import "assets/css/History.module.scss";
//觀看記錄頁面

class History extends Component {
  $$isMount = false;
  state = {
    listData: [],
    loading: true, // 骨架屏狀態
    scrollLoading: false, // 滾動區域狀態
    hasMore: true,
    offset: 0
  }
  async componentDidMount() {
    this.$$isMount = true;
    const {
      updateFileName,
      match,
      updateRoute,
      $rootURL,
      $language: currentLanuage
    } = this.props;
    updateFileName("home");
    updateRoute({ currentLanuage, realUrl: match.url.replace($rootURL, "")});
    
    await userLog.history().then(ret => {
      if(!!this.$$isMount) this.setState({
        listData: ret.rows,
        loading: false
      });
      console.log(this.state.listData);
    }).catch(_msg => {
      console.log(_msg);
    })
  }

  componentWillUnmount = async () => {
    this.$$isMount = false;
  }

  skeletonList = () => {
    let dom = [];
    for(let i=0; i<10; i++){
      dom.push(<Col span={18} key={i}><Skeleton active avatar /></Col>)
    }
    return dom;
  }

  handleInfiniteOnLoad = async () => {
    const { translations } = this.props;
    let data = this.state.listData;
    this.setState({
      scrollLoading: true,
    });
    let num = this.state.offset + 10;
    await userLog.history(num).then(ret => { 
      data = data.concat(ret.rows);
      if (ret.rows.length <= 0 ) {
        message.warning(translations.initDone && intl.get("general.no_more_record"));
        this.setState({
          hasMore: false,
          scrollLoading: false
        });
        return;
      }
      this.setState({
        listData: data,
        offset: num,
        scrollLoading: false
      });
    })
  }
  render() {
    const { translations } = this.props;
    return (
      <div className='history_container' style={{ backgroundColor: "#fff" }}>
        <Row style={{padding: '30px 0'}} className='main_container' type='flex' justify='center'>
          <TitleCard
          title={translations.initDone &&
            intl.get("history.content.title")}
          titleBgColor='#1cb394'
          titleColor='#fff'
          >
            <div className='infinite_container'>
              <InfiniteScroll
              initialLoad={false}
              pageStart={0}
              loadMore={this.handleInfiniteOnLoad}
              hasMore={!this.state.scrollLoading && this.state.hasMore}
              useWindow={false}
              >
                <Row className='list_container' type='flex' justify='center'>
                  {!this.state.loading ? 
                  this.state.listData.map(item => (
                      <Col key={item.id} span={18} className='item_container'>
                        <Adapter item={item} res_type={item.type} ref_id={item.ref_id} nWindow={true}>
                          <Row>
                            <Col style={{border: '2px solid #f2f2f2'}} sm={9} xs={24}>
                              {item.file ? <Resource picUrl={item.file} /> : <Empty style={{margin: 0}} />}
                            </Col>
                            <Col sm={{span: 13, offset: 2}} xs={24}>
                              <h3>{item.name}</h3>
                              <p>{item.description}</p>
                            </Col>
                          </Row>
                        </Adapter>
                      </Col>
                  )) : 
                  this.skeletonList()
                  }
                </Row>
              </InfiniteScroll>
            </div>
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
)(History);
