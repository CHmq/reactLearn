import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { Row, Col, Radio, Button, Icon, message, Modal, Select } from 'antd';
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import InfiniteScroll from "react-infinite-scroller";
import UploadingDocumentFile from "components/common/UploadingDocumentFile";
import ImgPreview from "components/common/ImgPreview";
import main from "components/services/mainService";
import article from "components/services/articleService";
import userLog from "components/services/userLogService";
import Loading from "components/common/Loading";
import "assets/css/article.module.scss";
import styleCss from "assets/css/CourseFinish.module.scss"; 

import circleB from "assets/image/CircleB.png";
import circleG from "assets/image/CircleG.png";
import circleR from "assets/image/CircleR.png";

const { Option } = Select;

class Article extends Component {
  $$isMount = false;
  state = {
    visible: false,
    region: this.props.$location,
    lang: this.props.$language.value,
    btnData: [],
    fixedData: [],
    listData: [],
    allData: [],
    planData: [],
    genCertJob: [],
    planDate: null,
    uploadData: "",
    menu: 'all',
    select: 'all',
    scrollLoading: false, // 滾動區域狀態
    hasMore: true,
    offset: 0,
    $$loading: true,
    uploadingFile: false,
    isDone: true 
  }

  componentDidMount() {
    const { user, updateFileName } = this.props;
    updateFileName("home");
    this.$$isMount = true;
    const {region, lang} = this.state;
    this.getMenu(region, lang);
    this.getDisplayList(region, lang);
    this.getCeoPeriod(region);
    if(user.id) this.getserRecord();
  }

  componentWillUnmount = async () => {
    this.$$isMount = false;
  }

  //list 数据
  async getDisplayList(region, lang) {
    await main.getDisplayList(region, lang, 0, 9999).then(ret => {
      if(!!this.$$isMount) this.setState({listData: ret.rows.slice(0, 12), allData: ret.rows, fixedData: ret.rows}, () => {
        ret.rows.forEach((item) => {
          if(item.is_ceo_done === 'N') this.setState({isDone: false});
        })
        this.getPlanData(ret.rows.slice());
      });
    }).catch(_msg => {
      console.log(_msg);
    });
  }

  async getCeoPeriod(region) {
    await main.getCeoPeriod(region).then(ret => {
      this.setState({planDate: ret});
    }).catch(_msg => {
      console.log(_msg);
    });
  }

  genIMg = (index) => {
    let mapping = [circleB, circleG, circleR,];
    return mapping[(index % mapping.length)];
  }

  //plan 數據
  getPlanData = (data) => {
    data.forEach((item, index) => {
      if(!!item.ceo_icon) {
        data.splice(index, 1);
        data.unshift(item);
      }
    })
    this.setState({planData: data})
  }

  //button 数据
  async getMenu(region, lang) {
    await main.getMenu(region, lang).then(ret => {
      if(!!this.$$isMount) this.setState({btnData: ret, $$loading: false});
    }).catch(_msg => {
      console.log(_msg);
    });
  }

  async getserRecord() {
    await article.userRecord().then(ret => {
      if(!!this.$$isMount) this.setState({uploadData: ret.file || ""});
    }).catch(_msg => {
      console.log(_msg);
    });
  }

  //button 點擊切換
  handleClickBtn = async (name) => {
    const {fixedData, select } = this.state;
    let allData = [];
    allData = fixedData.filter((items) => {
      if(name === 'all' && select === 'all') return items;
      if(name !== 'all' && select === 'all') return (items.tag.filter(_tag => _tag.tag === name) || []).length > 0;
      return (items.tag.filter(_tag => _tag.tag === name) || []).length > 0;
    })
    this.setState({
      hasMore: true, scrollLoading: false, offset: 0, allData, menu: name,
      listData: allData.filter((item, index) => index < 12)
    })
  }
  // 滑動加載
  handleInfiniteOnLoad = async () => {
    const { translations } = this.props;
    let allData = this.state.allData;
    let data = this.state.listData;
    this.setState({ scrollLoading: true });
    let num = this.state.offset + 12;
    data = data.concat(allData.slice(num, num + 12));
    if(num >= allData.length) {
      message.warning(translations.initDone && intl.get("general.no_more_record"));
      this.setState({
        hasMore: false,
        scrollLoading: false
      });
    }
    this.setState({
      scrollLoading: false,
      listData: data,
      offset: num
    });
  }

  showModal = (value) => {
    this.setState({
      visible: value
    });
  };

  onSelect = async (value) => {
    const {fixedData, menu } = this.state;
    let allData = [];
    allData = fixedData.filter((item) => {
      if(value === 'all' && menu === 'all') return item;
      if(value !== 'all' && menu === 'all') return item.is_ceo_done === value;
      return item.is_ceo_done === value;
    })
    this.setState({
      hasMore: true, scrollLoading: false, offset: 0,
      allData, select: value,
      listData: allData.filter((item, index) => index < 12)
    })
  }

  setUploadingFile = (uploadingFile, uploadingFileType) => {
    if (!!this.$$isMount) {
        this.setState({uploadingFile, uploadingFileType});
    }
  }

  //上傳成功
  uploadingDone = () => {
    this.setUploadingFile(false);
    // this.$$course.current.getData();
  }

  getListByUser = async () => {
    let ret = await userLog.getListByUser().then(ret => {
      const status = ret.length && ret.every(_ => _.status === 'DONE');
      if(status) {
        this.setState({ genCertJob: ret, loadStatus: true });
      }
      return {
        list: ret,
        status
      };
    }).catch(err => {
      return {
        list: [],
        status: false
      }
    })
    return ret;
  }

  // 獲取證書
  genCeoCertJob = async () => {
    let ret = await this.getListByUser();
    if(!ret.status) {
      userLog.genCeoCertJob().then(ret => {
        this.onRefresh();
      })
    }
  }

  // 取得證書 圖片預覽刷新
  onRefresh = () => {
    this.getListByUser();
  }

  createModal = (title = '') => {
    return (
      <Modal
        title={title}
        centered
        bodyStyle={{backgroundColor: "#fff"}}
        visible={this.state.uploadingFile}
        onCancel={() => this.setState({uploadingFile: false})}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
        >
        <UploadingDocumentFile
          // type={this.state.uploadingFileType}
          onCancel={() => {this.uploadingDone()}}
        />
      </Modal>
    );
  }

  _lang = (value) => {
    return this.props.translations.initDone && intl.get(value);
  }

  render() {
    const { translations, route, user: {id: uID}, locationUrl, $language } = this.props;
    const { visible, btnData, listData, planData, planDate, lang, $$loading, menu, uploadData } = this.state;
    const dateFormat = $language.value === 'english' ? 'LL' : 'YYYY年MM月DD日';
    return ( 
      !!$$loading ? <Loading /> : (
        <InfiniteScroll
        initialLoad={false}
        pageStart={0}
        loadMore={this.handleInfiniteOnLoad}
        hasMore={!this.state.scrollLoading && this.state.hasMore}
        useWindow={true}
        >
          <Row className='article_container' type='flex' justify='center'>
            {/* banner */}
            <Col span={24} className='banner_container'>
              <img src={require(`assets/image/parent/ceo_banner_${lang}.png`)} alt="banner"/>
            </Col>
            {/* button */}
            <Col span={24} className='btn_container'>
              <Row type='flex' justify='center' style={{maxWidth: 1200, margin: '0 auto'}}>
                <Col xl={3} xs={22} className='mb10'>
                  <Link to={`${locationUrl}parent`}>
                    <Button>{translations.initDone && intl.get("general.button.back")}</Button>
                  </Link>
                </Col>
                <Col xl={21} xs={22}>
                  <div className='article_btn mb10'>
                    <span>{translations.initDone && intl.get("general.title.classify")}：</span>
                    <Radio.Group defaultValue={menu} buttonStyle="solid">
                      <Radio.Button
                      value='all'
                      onClick={() => this.handleClickBtn('all')}
                      >
                        {translations.initDone && intl.get("general.form.all")}
                      </Radio.Button>
                      {btnData.map(item => (
                        <Radio.Button
                        key={item.id}
                        value={item.name}
                        onClick={() => this.handleClickBtn(item.tag)}
                        >
                          {item.name}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>
                  <div className='fixed_btn left'>
                    {(!!uID && route.currentLocation !== 'my') && (<Button type='primary' onClick={() => this.showModal(true)}>{translations.initDone &&
                    intl.get("article.button.plan")}</Button>)}
                    <Modal
                      width={800}
                      bodyStyle={{padding: 30, border: '5px solid #74bfff', borderRadius: 4}}
                      visible={visible}
                      onCancel={() => this.showModal(false)}
                      footer={null}
                    >
                      <div style={{textAlign: 'center'}}>
                        <img src={require(`assets/image/parent/ceo_title_${lang}.png`)} style={{width: '60%'}} alt=""/>
                      </div>
                      <Row
                        gutter={10}
                        style={{width: '100%', padding: '20px 0', background: '#fff'}}
                        type="flex"
                        className={styleCss.blackboard}>
                        {planData.map((item,index)=>{
                          return (
                            <Col xs={6} sm={4} md={3} xl={3} key={index}
                            className={styleCss.item}>
                              <img 
                              className={styleCss.circle} 
                              src={this.genIMg(index)} 
                              alt=""/>
                              <img className={styleCss.avatar} src={item.ceo_icon} alt=""/>
                            </Col>
                          )})}
                      </Row>
                      {planData.filter(_ => _.ceo_icon).length > 15 && (
                        <div style={{textAlign: 'center'}}>
                          <ImgPreview
                            data={this.state.genCertJob}
                            loadStatus={this.state.loadStatus}
                            onRefresh={this.onRefresh}
                            onClose={() => this.setState({loadStatus: false})}
                            medal={true}
                          >
                            <Button type="primary" onClick={this.genCeoCertJob}>獲得證書</Button>
                          </ImgPreview>
                        </div>
                      )}
                      {this.createModal("請選擇需要上傳的文件")}
                      {this.state.isDone && (
                        <div style={{textAlign: 'center', marginBottom: 20}}>
                          {(!!planDate && moment().isBetween(planDate.start_date, planDate.record_end_date)) && (
                            <Fragment>
                              <Button type='primary' onClick={()=>this.setState({uploadingFile: true})}>
                                {this._lang("article.planPopup.button.submit")}
                              </Button>
                              <br />
                              {!!planData ? (
                                <a href={uploadData} target="blank">
                                  <Icon type="file" /><span className={styleCss.uploadDataBtn}>{this._lang("article.planPopup.button.view")}</span>
                                </a>
                              ) : ""}
                            </Fragment>
                          )}
                        </div>
                      )}
                      <div dangerouslySetInnerHTML={{__html: this._lang("article.planPopup.txt")}} />
                      {planDate && (
                        <p dangerouslySetInnerHTML={{__html: 
                          `${this._lang("article.planPopup.record_end_msg")}
                            ${(moment(planDate.start_date).format(dateFormat))}
                            ${$language.value === 'english' ? 'to' : '至'}
                            ${(moment(planDate.record_end_date).format(dateFormat))}
                          <br/>
                          ${this._lang("article.planPopup.submit_end_msg")}
                          ${(moment(planDate.submit_end_date).format(dateFormat))}
                          `
                        }} />
                      )}
                    </Modal>
                  </div>
                </Col>
              </Row>
            </Col>
            {/* select */}
            {(!!uID && route.currentLocation != 'my') && (
              <Col xl={24} xs={22} style={{maxWidth: 1200, paddingTop: 10}}>
                <Select defaultValue="all" style={{ width: 120 }} onChange={this.onSelect}>
                  <Option value="all">{translations.initDone && intl.get("general.form.all")}</Option>
                  <Option value="N">{translations.initDone && intl.get("general.form.unread")}</Option>
                  <Option value="Y">{translations.initDone && intl.get("general.form.read")}</Option>
                </Select>
              </Col>
            )}
            {/* list */}
            <Col className='list_container' xl={24} xs={22}>
              <Row gutter={20}>
                {listData.map((item, index) => (
                  <Link key={item.id + index} to={`${locationUrl}parent/article/${item.id}`}>
                    <Col xl={6} md={8} sm={12} xs={24}>
                      <div style={{width: '100%', height: 200, background: `url(${item.thumbnail} )`, backgroundSize: 'cover', borderRadius: 8}}></div>
                      <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
                        <p className='list_text'>{item.title}</p>
                        <div className='list_like'>
                          <span><Icon type="like" />{!item.num_of_vote ? 0 : item.num_of_vote < 1000 ? item.num_of_vote : (Number(item.num_of_vote)/1000).toFixed(1) + 'k'}</span>
                          &nbsp;&nbsp;&nbsp;
                          <span><Icon type="eye" />{!item.num_of_view ? 0 : item.num_of_view < 1000 ? item.num_of_view : (Number(item.num_of_view)/1000).toFixed(1) + 'k'}</span>
                        </div>
                      </div>
                    </Col>
                  </Link>
                ))}
              </Row>
            </Col>
            <Col span={0} style={{textAlign: 'center'}}>
              <h1 style={{fontSize: '30px'}}>{translations.initDone && intl.get("general.coming_soon")}</h1>
                  <Link to={`/${route.currentLocation}/${route.currentLanguage.url}/parent`}>{translations.initDone && intl.get("general.button.back")}</Link>
            </Col>
          </Row>
        </InfiniteScroll>
      )
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
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    updateRoute: payload => dispatch({ type: "updateRoute", payload }),
    initUrl: payload => dispatch({ type: "initUrl", payload })
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(Article);