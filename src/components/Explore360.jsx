import React, { Component } from 'react';
import { Modal, Tooltip, Icon, Select, Row, Col, Spin, Avatar, Tag } from 'antd';
import { connect } from "react-redux";
import intl from "react-intl-universal";
import userLog from "components/services/userLogService";
import styles from "assets/css/Explore360.module.scss";
import FilePreview from "components/resource/FilePreview";

const Option = Select.Option;
const { CheckableTag } = Tag;

class Explore360 extends Component {
  state = {
    visible: false,
    classList: null,
    report: null,
    $$getClassList : null,
    $$getReport : null,
    spinning: false,
    checked: {},
    fixed: null
  }

  showModal = (e) => {
    e.preventDefault();
    this.setState({ visible: true });
  };

  handleCancel = e => {
    e.preventDefault();
    this.setState({ visible: false });
  };

  getReport = async(class_id = null) => {
    const { item: { ref_id, course_id } } = this.props;
    if(!!this.state.$$getReport) {
      return this.state.$$getReport;
    }
    let $$call = userLog.getUserReport(class_id, ref_id, course_id).catch(err => []).then((ret) => {
      this.setState({ $$getReport : null, report: ret, fixed: ret, spinning: false}, () => {
        this.handleChange();
      });
      return ret;
    });
    this.setState({$$getReport : $$call, spinning: true});
  }

  isImgOrVideo = (file) => {
    let flag = false;
    let typeArr = [".jpeg", ".jpg", ".png", ".gif", ".mp4", ".rmvb", ".avi", ".ts"];
    if (file) {
      let fileType = file.substr(file.lastIndexOf(".")).toLowerCase();
      typeArr.forEach(item => {
        if(item === fileType) flag = true;
      })
    }
    return flag;
  }

  handleChange(tag, status) {
    const { checked, fixed } = this.state;
    const { res_type } = this.props.item;
    const _checked = checked;
    let data = [];
    let resType = res_type === 'project' ? 'project_file' : 'explore_file';

    _checked[tag] = status;

    const { submit_Y, submit_N, score_Y, score_N } = _checked;
    if(!submit_Y) {
      _checked.score_Y = false;
      _checked.score_N = false;
    }
    data = fixed;
    if(submit_Y || submit_N) {
      if(submit_Y && submit_N) {
        data = fixed.filter(item => score_Y ? !!item.icon : (score_N ? !!item[resType] && !item.icon : item));
        if(score_Y && score_N) {
          data = fixed;
        }
      } else if (submit_Y) {
        data = fixed.filter(item => score_Y ? !!item.icon : (score_N ? !!item[resType] && !item.icon : !!item[resType]));
        if(score_Y && score_N) {
          data = fixed.filter(item => !!item[resType]);
        }
      } else {
        data = fixed.filter(item => !item[resType]);
      }
    } 
  
    this.setState({ checked: _checked, report: data});
  }

  render() {
    const { report, spinning } = this.state;
    const { translations, classList, item, route: { currentLanguage } } = this.props;
    let type = item.res_type === 'project' ? 'project_file' : 'explore_file';
    const _lang = function(value) {
      return translations.initDone && intl.get(value);
    };
    const style = {
      width: 40,
      height: 40,
      background: 'rgba(0, 0, 0, 0.5)',
      color: '#fff',
      fontSize: '20px',
      lineHeight: '40px',
      textAlign: 'center',
      borderRadius: '0 20px 0 0',
      cursor: 'pointer'
    }
    return (
      <div style={{ display: "inline-block" }}>
        <div onClick={this.showModal}>
          {this.props.children || (
            <Tooltip placement="right" title={_lang("course_1.content.reportbtn")}>
              <div style={style}><Icon type="pie-chart"  /> </div>
            </Tooltip>
          )}
        </div>
        <Modal
          title={<h3>{this.props.item.name}</h3>}
          width={1200}
          visible={this.state.visible}
          footer={null}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          centered={true}
          destroyOnClose={true}
          className={styles.wrap}
          zIndex={888}
        >
          <Select style={{ width: '100%' }} defaultOpen 
            onChange={(class_id) => {
              this.getReport(class_id);
              this.setState({class_id});
            }} 
            placeholder={_lang('general.button.select_class')}>
            {classList && classList.map((item) => (
              <Option key={item.class_id} value={item.class_id}>{item.year_name + " " + item.grade_name + item.class_name}</Option>
            ))}
          </Select>
          {!!this.state.class_id && (
            <div style={{margin: '10px 0'}}>
              {[
                {key: 'submit_Y', value: _lang('general.button.submitted')},
                {key: 'submit_N', value: _lang('general.button.unsubmitted')}
              ].map(item => (
                <CheckableTag 
                key={item.key}
                checked={this.state.checked[item.key]}
                onChange={(status) => this.handleChange(item.key, status)}>
                  {item.value}
                </CheckableTag>
              ))}
            </div>
          )}
          {this.state.checked.submit_Y && (
            <div style={{margin: '10px 0'}}>
              {[
                {key: 'score_Y', value: _lang('general.button.rated')}, 
                {key: 'score_N', value: _lang('general.button.not_rated')}
              ].map(item => (
                <CheckableTag 
                key={item.key}
                checked={this.state.checked[item.key]}
                onChange={(status) => this.handleChange(item.key, status)}>
                  {item.value}
                </CheckableTag>
              ))}
            </div>
          )}
          <Spin spinning={spinning}>
            <Row gutter={20} type="flex" className={styles.list_container}>
              {report && report.map(ret => (
                <Col xs={12} md={4} key={ret.user_id} className={styles.list_item}>
                  <div className={styles.list_item_inner}>
                    {ret[type]
                    ? 
                    (<FilePreview file={ret[type]} id={ret.ur_id} showComment={item.res_type === "project"} commentType="add" callback={()=>this.getReport(this.state.class_id)}>
                      {this.isImgOrVideo(ret[type]) ? (ret[type].endsWith(".mp4") ? <video src={ret[type]} /> : <img className={styles.file_img} src={ret[type] + '!small'} alt='' />) : <Icon style={{height: 100, fontSize: 30}} type="file" />}
                    </FilePreview>)
                    : 
                    <h1>{_lang("general.msg.not_submitted")}</h1>
                    }
                    <h3>{ret.name}</h3>
                    <h4>{ret.class_name}{!!ret.student_no && '('}{ret.student_no}{!!ret.student_no && ')'}</h4>
                    <div>
                      {item.res_type !== "project" && ['movie', 'vocab', 'mc', 'extend', 'story'].map(name => (
                         (<img src={require(`assets/image/explore360/${currentLanguage.value}/${name}.png`)} style={{width: 25, marginRight: 5, filter: `grayscale(${ret[`${name}_status`] === 'N' ? '100%' : '0%'})`}} key={name} alt={name}/>)
                      ))}
                    </div>
                  </div>
                  {!!ret.icon && (
                    <div className={styles.list_comment_icon}>
                      <Avatar size="large" src={ret.icon} />
                    </div>
                  )}
                </Col>))}
            </Row>
          </Spin>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations
  };
}
export default connect(
  mapStateToProps,
  )(Explore360);