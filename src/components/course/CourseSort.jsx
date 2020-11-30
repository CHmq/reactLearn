//新增課程裏的課程排序頁面
import React, { Component } from 'react';
import { Row, Col, Button, message, Empty } from 'antd';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { connect } from "react-redux";
import intl from "react-intl-universal";
import arrayMove from 'array-move';
import course from "components/services/courseService";
import Resource from 'components/course/Resource';
import 'assets/css/CourseSort.module.scss';

const SortableItem = SortableElement(({value}) => {
  return (
    <Col lg={8} sm={8} xs={12} style={{zIndex: 1002}}>
      <Resource picUrl={value.file} title={value.name} titleFontSize={'12px'}MemMargin='3px'/>
    </Col>
  )
});

const SortableList = SortableContainer(({items}) => {
  return (
    <Row>
      {items.map((item, index) => {
        return(
          <SortableItem key={item.id} index={index} value={item} />
        )
      })}
    </Row>
  );
});

class CourseSort extends Component {
  state = {
    data: this.props.data
  }
  componentDidMount() {
    const { updateFileName } = this.props;
    updateFileName("home");
  }
  componentWillReceiveProps(newProps) {
    this.setState({ data: newProps.data });
  }
  //提交
  handleSubmit = async e => {
    e.preventDefault();
    let value = this.props.formData;
    let arr = [];
    let type = value.id ? '修改' : '添加';
    let AddOrUpdate = value.id ? 'courseUpdate' : 'courseAdd';
    this.state.data.forEach((item, index) => {
      let obj = {'ref_id': item.id, 'type': 'RESOURCE', 'sort': index + 1}
      arr.push(obj);
    });
    await course[AddOrUpdate](value, arr).then(ret => {
      this.props.closePopup();
      this.props.refresh();
      message.success(`${type}成功`);
      console.log(ret);
    }).catch(_msg => {
      message.error(`${type}失敗`);
      console.log(_msg);
    });
  }
  //取消
  handleCancel = () => {
    this.props.onCancel();
  }
  //排序之後的回調
  onSortEnd = ({oldIndex, newIndex}) => {
    this.setState(({data}) => ({
      data: arrayMove(data, oldIndex, newIndex)
    }));
  };
  render() {
    const { translations } = this.props;
    return (
    <Row type='flex' justify='center'>
      <div className='courseSort_container'>
          <Col lg={16} md={18} sm={20} xs={22}>
            <h3 className='tooltip'>{translations.initDone && intl.get("course_1.courseSort.prompt")}</h3>
          </Col>
          <Col lg={16} md={18} sm={20} xs={22} className='courseList_container'>
            {this.state.data.length ? 
            <SortableList axis='xy' items={this.state.data} onSortEnd={this.onSortEnd}/> : 
            <Empty style={{marginTop: 100}}/>
            }
          </Col>
          <Col span={24} className='button_container'>
            <Button type='primary' onClick={this.handleCancel}>{translations.initDone && intl.get("course_1.courseSort.button.previous")}</Button>
            <Button type='primary' onClick={this.handleSubmit}>{translations.initDone && intl.get("course_1.courseSort.button.done")}</Button>
          </Col>
      </div>
      </Row>
    );
  }
}

/** redux 獲得全局數據
 * route  route data (url, language) --暫時沒有用到
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
  };
}

export default connect(mapStateToProps,mapDispatchToProps)(CourseSort);