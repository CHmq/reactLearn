// import { getRandom } from "components/utils/helper";
import React, { Component } from "react";
import { Row, Col, Button, Radio, Input, message, Spin, Icon } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { Link } from "react-router-dom";
import Video from "components/common/ArtcleVideo";
import Score from "components/common/Score";
import Loading from "components/common/Loading";
import CommentList from "./common/CommentList";

import articleInfo from "./services/mainService";

import article from "assets/css/ArticleInfo.module.scss";
import { blockParams } from "handlebars";
const { TextArea } = Input;
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
/**
 * page name:文章完成
 *
 * */

class ArticleInfo extends Component {
  state = {
    list: [],
    date: [],
    isPlay: true, //視頻播放
    category: "", //類別
    question: "",
    answer: [],
    value: "", //問題答案
    star: "", //星星
    faceHeight: "",
    answervalue:"",//用户選擇的value
    otherInfo: "", //用户提交答案
    stardisabled: false, //星星按钮禁用
    scoredisabled: false, //投票顯示
    disabled: false, //選擇按钮禁用
    textareaValue: "", //提交評論
    $$loading: true,
    submitLoading: {
      star: false,
      vote: false,
      answer: false,
      comment: false
    }
  };

  async componentDidMount() {
    console.log(this.props);
    const {
      currentLocation: region,
      currentLanguage: { value: lang }
    } = this.props.route;
    const {
      params: { article_id: articleID }
    } = this.props.match;
    this.setState({
      list: await articleInfo
        .getDisplay(articleID, region, lang)
        .then(ret => {
          console.log(ret);
          this.setState({
            info: ret.info,
            date: ret.item,
            question: ret.question,
            answer: ret.answer,
            otherInfo: ret.other_info,
            $$loading: false
          });
          
          let value = ret.other_info.vote;
          let total = ret.other_info.vote_total;
          const data1 = [];

          if (ret.other_info.user_star) {
            this.setState({
              stardisabled: true
            });
          }
          if (ret.other_info.user_vote) {
            this.setState({
              scoredisabled: true
            });
          }
          if (ret.other_info.user_answer) {
            let answervalue = ret.other_info.user_answer;
            this.setState({
              disabled: true,
              answervalue
            }, () => {
              console.log(this.state.answervalue);
            })
          }
          //投票分数
          value.forEach(item => {
            let num = (item / total).toFixed(2) * 100;
            data1.push(num);
            this.setState({
              faceHeight: data1
            });
          });
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg);
          return [];
        })
    });
  }

  //Video播放
  ShowUploading = (type = []) => {
    this.setUploadingFile(true, type);
  };

  //单选
  onChange = e => {
    console.log(e.target.value);
    this.setState({
      value: e.target.value
    });
  };

  //評星
  starScor = index => {
    let category = "star";
    if(!this.state.stardisabled) {
      this.articleSubmit(category, index.score);
    }
  };

  //投票
  handleClick = index => {
    let category = "vote";
    if(!this.state.scoredisabled) {
      this.articleSubmit(category, index);
    }
  };

  //提交選擇
  handleSubmit = event => {
    let category = "answer";
    let value = this.state.value;
    this.articleSubmit(category, value);
  };

  articleSubmit = async (category, value) => {
    let region = this.props.route.currentLocation;
    const { translations } = this.props;
    const {
      params: { article_id: articleID }
    } = this.props.match;
    this.setState({submitLoading: {...this.state.submitLoading, [category]: true}});
    try {
      await articleInfo
        .addrecord(region, category, value, articleID)
        .then(ret => {
          message.success(translations.initDone && intl.get("general.msg.submit_success"));
          this.componentDidMount();
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg);
          message.error(translations.initDone && intl.get("general.error.submit_fail"));
          return [];
        });
        this.setState({submitLoading: {...this.state.submitLoading, [category]: false}});
    } catch (error) {
      console.log(error);
    }
  };

  //设置textareaValue
  handleTextareaChange(e) {
    this.setState({
      textareaValue: e.target.value
    });
  }
  //提交評論
  _submit = event => {
    let region = this.props.route.currentLocation;
    const {
      params: { article_id: articleID }
    } = this.props.match;
    console.log(region);
    if (this.state.textareaValue.length === 0) {
      return false;
    }
    this.setState({submitLoading: {...this.state.submitLoading, comment: true}});
    this.textareaSubmit(region, this.state.textareaValue, articleID);
  };

  textareaSubmit = async (region, comment, articleID) => {
    const { translations } = this.props;
    try {
      await articleInfo
        .addList(region, comment, articleID)
        .then(ret => {
          console.log(ret);
          message.success(translations.initDone && intl.get("general.msg.submit_success"));
          this.setState({
            textareaValue: ""
          });
          this.child.componentDidMount();
          return ret;
        })
        .catch(_msg => {
          //SHOW MESSAGE
          console.log(_msg);
          message.error(translations.initDone && intl.get("general.error.submit_fail"));
          return [];
        });
        this.setState({submitLoading: {...this.state.submitLoading, comment: false}});
    } catch (error) {
      console.log(error);
    }
  };
  onRef = ref => {
    this.child = ref;
  };

  render() {
    const { id: uID } = this.props.user;
    const { translations, locationUrl, $language:{ value } } = this.props;
    const { $$loading, submitLoading: {star, vote, answer, comment} } = this.state;
    const radioStyle = {
      display: "block",
      lineHeight: "30px",
      whiteSpace: "normal"
    };
    let face = [1, 2, 3, 4, 5, 6]; //表情
    let faceHeight = this.state.faceHeight;
    const _fn = function(value) {
      return translations.initDone && intl.get("articleInfo." + value);
    };
    const Language = {
      scoring: _fn("scoring"),
      title: _fn("title"),
      star: _fn("star"),
      vote: _fn("vote"),
      questions: _fn("questions"),
      answer: _fn("answer"),
      comment: _fn("comment"),
      btn: _fn("btn")
    };
    return (
      !!$$loading ? <Loading /> : (
        <div>
          {this.state.date.map((item, index) => {
            if (item.type === "video") {
              return (
                <Row key={index} className={article.banner1}>
                  <div className={article.mask}></div>
                  <Col
                    xs={{ span: 24 }}
                    sm={{ span: 18, offset: 3 }}
                    md={{ span: 14, offset: 5 }}
                    lg={{ span: 10, offset: 7 }}
                  >
                    <Video
                      videosrc={item.file}
                      playing={this.state.isPlay}
                    >
                      <div onClick={() => this.ShowUploading("video")} />
                    </Video>
                  </Col>
                </Row>
              );
            } if(item.type === "text") {
              return (
                <Row 
                style={{maxWidth: 1200, margin: '0 auto'}}
                type="flex" 
                justify="space-around" key={index}>
                  <Col xl={24} xs={22} style={{paddingTop: 10}}>
                    <Link to={`${locationUrl}parent/article`}>{translations.initDone && intl.get("general.button.back")}</Link>
                  </Col>
                  <h1>{ this.state.info[0].title }</h1>
                  <Col xl={24} xs={22}>
                    <div className={`${article.content}`}>
                      <div dangerouslySetInnerHTML={{ __html: item.text }} />
                    </div>
                  </Col>
                </Row>
              );
            } else {
              return (
                <div key={index} style={{ maxWidth: "640px", margin: "0 auto" }}>
                  <img
                    src={item.file}
                    alt=""
                    className={`${article.article_img}`}
                  />
                </div>
              )
            }
          })}
          {!!uID && (
            <Row
            style={{maxWidth: 1200, margin: '0 auto'}}
            type="flex" justify="space-around">
              <Col xl={24} xs={22}>
                <Col lg={{ span: 8 }}>
                  <div className={`${article.bg}`}>
                    <h2>{Language.scoring}</h2>
                    <p style={{margin: 0}}>
                      <span>{Language.title}</span>
                    </p>
                    <Spin indicator={antIcon} spinning={star}>
                      <div className={`${article.star}`}
                      style={{cursor: !this.state.stardisabled ? 'pointer': 'no-drop'}}
                      >
                        <h4>{Language.star}</h4>
                        <Score
                          value={this.starScor}
                          data={
                            !!this.state.otherInfo
                              ? this.state.otherInfo.user_star
                              : 0
                          }
                        />
                      </div>
                    </Spin>
                    <Spin indicator={antIcon} spinning={vote}>
                      <div className={`${article.face}`}>
                        <h4>{Language.vote}</h4>
                        {face.map(index => {
                          return (
                            <div key={index} className={`${article.score}`}
                            style={{cursor: !this.state.scoredisabled ? 'pointer' : 'no-drop'}}
                            >
                              {this.state.scoredisabled ? (
                                <div
                                  style={{
                                    background: "#1890ff",
                                    height: faceHeight[index - 1] + "px",
                                    width: "15px",
                                    display: "block",
                                    margin: "0 auto",
                                    maxHeight: 60
                                  }}
                                />
                              ) : (
                                ""
                              )}
                              <div onClick={this.handleClick.bind(this, index)}>
                                <img
                                  src={require("assets/image/emoji" + index + ".png")}
                                  alt=""                                  
                                />
                                <p style={{ transform: value === 'english' ? 'scale(0.85)' : 'scale(1)'}}>
                                {translations.initDone && intl.get("articleInfo.vote" + index)}</p>
                                {!this.state.scoredisabled && <Radio value={index} style={{margin:0}} ></Radio>}
                              </div>                              
                            </div>
                          );
                        })}
                      </div>
                    </Spin>
                  </div>
                </Col>
                <Col lg={{ span: 8 }}>
                  <Spin indicator={antIcon} spinning={answer}>
                    <div className={`${article.bg}`}>
                      <h2>{Language.questions}</h2>
                      <h4>{this.state.question.title}</h4>
                      <div>
                        <Radio.Group
                          onChange={this.onChange}
                          name="radiogroup"
                          defaultValue={this.state.answervalue}
                          disabled={this.state.disabled}
                        >
                          {this.state.answer.map((item, index) => {
                            return (
                              <Radio style={radioStyle} value={item.id} key={index}
                              checked={this.state.answervalue === item.id ? true : false}
                              >
                                <span
                                  // className={
                                  //   this.state.answervalue === item.id
                                  //     ? `${article.answervalue}`
                                  //     : ""
                                  // }
                                >
                                  {item.title}
                                </span>
                                {item.is_correct === "Y" && (
                                  <span
                                    className={
                                      this.state.disabled
                                        ? `${article.radioBlock}`
                                        : `${article.radioNone}`
                                    }
                                  >
                                    <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" style={{marginRight: 5}} />
                                  </span>
                                )}
                              </Radio>
                            );
                          })}
                        </Radio.Group>
                      </div>
                      <p className={`${article.btn}`}>
                        <Button
                          type="primary"
                          onClick={this.handleSubmit}
                          disabled={this.state.disabled}
                        >
                          {Language.btn}
                        </Button>
                      </p>
                    </div>
                  </Spin>
                </Col>
                <Col lg={{ span: 8 }}>
                  <Spin indicator={antIcon} spinning={comment}>
                    <div className={`${article.bg}`}>
                      <h2>{Language.comment}</h2>
                      <TextArea
                        rows={8}
                        className={`${article.textArea}`}
                        value={this.state.textareaValue}
                        onChangeCapture={this.handleTextareaChange.bind(this)}
                      />
                      <p className={`${article.btn}`}>
                        <Button type="primary" onClick={this._submit}>
                          {Language.btn}
                        </Button>
                      </p>
                    </div>
                  </Spin>  
                </Col>
              </Col>
              <Col 
                xl={24} xs={22}
                className={`${article.comment}`}
              >
                {!$$loading && (
                  <CommentList
                  onRef={this.onRef}
                  region={this.props.route.currentLocation}
                  articleID={this.props.match}
                  commentlist={this.state.commentlist}
                  />
                )}
              </Col>
            </Row>
          )}
        </div>
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

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArticleInfo);
