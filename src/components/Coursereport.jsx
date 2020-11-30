//新增课程页面
import React, { Component } from "react";
import { Table, Form, Select, Button, Icon, Row, Col, Spin } from "antd";
import { connect } from "react-redux";
import { SUPPORT_SCHOOL } from "config/course.json";
import intl from "react-intl-universal";
import userLog from "components/services/userLogService";
import school from 'components/services/school';
import user from "components/services/userService";
import FilePreview from "components/resource/FilePreview";

import "assets/css/studentedit.module.scss";

const Option = Select.Option;
class Coursereport extends Component {
  state = {
    report: [],
    reportColumn : [],
    courseList: [],
    classList: [],
    studentList: [],
    filterCourse : null,
    filterStudent : null,
    $$getClassList : null,
    $$getReport : null,
    flag: true,
    visible: false
  };

  //獲取頁面數據
  async componentDidMount() {
    this.init();
  }

  init = async() => {
      const { iCourseID } = this.props;
      this.setState( { reportColumn : this.defaultColumn() , filterCourse : null , filterStudent : null });
      this.getClassList();
      if(!!iCourseID) {
        this.getReport(null, iCourseID);
      }
  }

  //排序
  compare = (prop) => {
    return (obj1, obj2) => {
      let val1 = obj1[prop];
      let val2 = obj2[prop];
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
        val1 = Number(val1);
        val2 = Number(val2);
      }
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }            
    }  
  }
  getArr = (arr, trueOrFalse) => {
    return arr.filter((item) => {
      return item.name.startsWith('PN') === trueOrFalse;
    })
  }
  userClassList = (data) => {
    let data1 = this.getArr(data, true).sort(this.compare("name"));
    let data2 = this.getArr(data, false).sort(this.compare("name"));
    return data1.concat(data2);
  }
  //排序

  defaultColumn = ( resCount = 4) => {
    const { translations } = this.props;
    const _lang = function(value) {
      return translations.initDone && intl.get("general."+value)
    };
    let fixLeft = [
      {
        title: _lang('form.student_name'),
        width : 100,
        className:"bg2",
        dataIndex: "name",
        fixed : "left",
      },
      {
        title: _lang('form.course_name'),
        width : 100,
        className:"bg2",
        dataIndex: "course_name",
        fixed : "left",
      },
      {
        title: _lang('form.amount_completed'),
        width : 100,
        className:"bg2",
        dataIndex: "done",
        fixed : "left",
        render : (resource, item) => {
            return !!item ? (<React.Fragment>
                <div style={{ height: "auto" }}>
                    {item.done} / {item.count}
                </div>
                </React.Fragment>) : <h4> - </h4>;
        }
      }
    ] , fixRight = [
      {
        title: _lang('form.action'),
        width : 100,
        className:"bg2",
        render: (text, item) => {
          return <Button disabled={true}>{ _lang('button.remind') }</Button>;
        },
        fixed : "right",
      }
    ] , resColumn = [];
    for(var i=0;i<resCount ; i++) {
      resColumn.push({
        title: _lang('form.resource') + `${(i+1)}`,
        width : 100,
        className : "bg2",
        dataIndex : `res_${i+1}`,
        render : (resource , item) => {
            return !!resource ? (<React.Fragment>
                <div style={{ height: "auto" }}>
                <img src={resource.file} style={{ height: "60px" }} alt=""/>
                <div>{resource.name}</div>
                <h4>{!!resource.status ? <Icon type="check" /> : <Icon type="close" />}
                {!!resource.explore_file && (
                <FilePreview file={resource.explore_file} display="inline-block"><Icon type="file" /></FilePreview>
                )}
                {!!resource.project_file && (
                <FilePreview file={resource.project_file} display="inline-block"><Icon type="file-text" /></FilePreview>
                )}
                </h4>
                {resource.res_type === 'jttw360' && (<div>
                  {['movie', 'vocab', 'mc', 'extend', 'story'].map(name => (
                     (<img src={require(`assets/image/explore360/zh/${name}.png`)} style={{width: 30, marginRight: 5, filter: `grayscale(${resource[`${name}_status`] === 'N' ? '100%' : '0%'})`}} key={name} alt={name}/>)
                  ))}
                </div>)}
                </div>
                </React.Fragment>) : <h4> - </h4>;
        }
      });
    }
    return [].concat(fixLeft , resColumn, fixRight );
  }
  
  getClassList = async() => {
      if(!!this.state.$$getClassList) {
          return this.state.$$getClassList;
      }
      let $$call = school.getClassList().then(ret => ret.rows).catch(err => []).then((ret) => {
        this.setState({classList: ret , $$getClassList : null} , () => {
//            this.getReport(this.state.classList[0]);
        });
      });
      this.setState({$$getClassList : $$call});
  }
  
  getReport = async(class_id = null, course_id = null) => {
      if(!class_id && !course_id){
        this.setState({ classID: class_id, courseID: course_id});
        return;
      }
      if(!!this.state.$$getReport) {
          return this.state.$$getReport;
      }
      let $$call = userLog.getStudentReport(class_id, course_id).catch(err => []).then((ret) => {
          let max = 0 , _courseList = [] , _userClassList = [];
          const report = Object.values(ret.reduce((_ret , _report) => {
              let uID = _report.token_uid , cID = _report.course_id , uq = `${uID}-${cID}` , classID = _report.class_id;
              
              if(!_userClassList[classID]) {
                  _userClassList[classID] = {
                      id : classID,
                      name : _report.class_name,
                      student_list : []
                  };
              }

              _userClassList[classID]['student_list'][uID] = {
                  id : uID ,
                  name : _report.name,
                  done : !!_userClassList[classID]['student_list'][uID] ? Number.parseInt(_userClassList[classID]['student_list'][uID]['done']) + Number.parseInt(_report.done) : _report.done,
                  count : !!_userClassList[classID]['student_list'][uID] ? Number.parseInt(_userClassList[classID]['student_list'][uID]['count']) + Number.parseInt(_report.count) : _report.count
              };
              
              if(!_courseList[cID]) {
                  _courseList[cID] = {
                      id : cID,
                      name : _report.course_name,
                      grade : _report.course_grade , 
                      class_list : _report.course_class ,
                  };
              }
              if(!_ret[uq]) {
                  _ret[uq] = {
                      id : uID,
                      user_id : _report.user_id,
                      name : _report.name ,
                      is_login : !!_report.user_id ,
                      class_id : _report.class_id,
                      course_id : cID,
                      course_name : _report.course_name,
                      course_grade : _report.course_grade , 
                      course_class : _report.course_class ,
                      resource : [],
                      done : 0,
                      count : 0
                  };
              }
              _ret[uq]['done'] = !!_ret[uq] ? Number.parseInt(_ret[uq]['done']) + Number.parseInt(_report.done) : _report.done;
              _ret[uq]['count'] = !!_ret[uq] ? Number.parseInt(_ret[uq]['count']) + Number.parseInt(_report.count) : _report.count;
              _ret[uq]['resource'][_report.res_id] = {
                  id : _report.res_id ,
                  name : _report.res_name,
                  file : _report.res_file,
                  status : !!_report.ref_id,
                  res_type : _report.res_type ,
                  movie_status : _report.movie_status ,
                  vocab_status : _report.vocab_status ,
                  mc_status : _report.mc_status ,
                  extend_status : _report.extend_status ,
                  story_status : _report.story_status ,
                  explore_file : _report.explore_file,
                  project_file : _report.project_file
              };

              return _ret;
          } , {})).map(_report => {
                  let _resource = Object.values(_report.resource);
                  if(max <  _resource.length) {
                      // console.log(_resource);
                      max =  _resource.length;
                  }
                  _resource.map((_res , _idx) => {
                     _report[`res_${_idx+1}`] = _res;
                     return null;
                  });
                  _report.resource = undefined;
                  return _report;
          });
          // console.log(report , max);
          let student_list = !!class_id && !!_userClassList[class_id] ? Object.values(_userClassList[class_id]['student_list']) : [];
          // console.log(student_list);
          _userClassList = Object.values(_userClassList);
          _userClassList.map(_class => (
            _class.student_list = Object.values(_class.student_list)
          ));
          this.setState({report , reportColumn : this.defaultColumn(max) , filterCourse : null , filterStudent : null , $$getReport : null , courseList : Object.values(_courseList) , userClassList : this.userClassList(_userClassList), studentList : student_list , classID : class_id , courseID : course_id} ,() => {
          });
      });
      this.setState({$$getReport : $$call});
  }
  
  courseChange = async (name) => {
    console.log(name);
    // console.log(await userLog.getStudentReport(id).then(ret => ret).catch(err => []));
  }
  
  render() {
    let merchantID = user.getType() === "STAFF" ? user.staff().merchant_uid : '';
    const { translations, iCourseID, item: {name}, grade } = this.props;
    const { courseList, classList , reportColumn , report , filterCourse , filterStudent , $$getClassList , $$getReport , userClassList , courseID } = this.state;
    const _lang = function(value) {
      return translations.initDone && intl.get("general."+value)
    };
    return (
      <div className="card-container">
        <div className="table-operations">
          {!iCourseID && (<Row gutter={20}>
            <Col md={6} sm={10} xs={24} style={{marginBottom: 10}}>
              <Select style={{width: '100%'}} placeholder={_lang('button.select_class')} onChange={(val) => {this.getReport(val, courseID);}} loading={!!$$getClassList} disabled={!!$$getClassList}>
                <Option key="class-all" value={null}>{_lang('button.select_all')}</Option>
                {classList.map((item) => (
                  <Option key={item.class_id} value={item.class_id}>{item.year_name + " " + item.grade_name + item.class_name}</Option>
                ))}
              </Select>
            </Col>
            <Col md={4} sm={8} xs={24} style={{marginBottom: 10}}>
              <Select style={{width: '100%'}} placeholder={_lang('button.select_course')} onChange={(val) => {
                    this.setState({filterCourse : val});
                }} >
                  <Option key="course-all" value={null}>{_lang('button.select_all')}</Option>
                {courseList.map(course => (
                  <Option key={course.id} value={course.id}>{course.name}</Option>
                ))}
              </Select>
            </Col>
          </Row>)}
          <Spin spinning={!!$$getReport}>
          <h3>{name}</h3>
                {!!filterStudent && (<Row><Button type="primary" onClick={() => {this.setState({filterStudent : null})}}>{_lang("button.back")}</Button><br/><br/></Row>)}
          <Row type='flex' style={{textAlign: 'center', maxHeight: '70vh', overflow: 'auto'}} gutter={10}>
            {SUPPORT_SCHOOL.indexOf(merchantID) > -1 && !filterStudent && !filterCourse && !!userClassList && userClassList.map(_class => (
                <Col md={6} sm={12} xs={24} key={`studentClass-${_class.id}`}>
                  <div style={{border: '1px solid rgb(237, 247, 255)', marginBottom: 20}}>
                    {!!_class.student_list && _class.student_list.map((_student, _index) => (
                    <Row key={`studentClassList-${_student.id}`} >
                        <Col>
                            <Col xs={12}>
                            {_index === 0 && (<div style={{background: '#edf7ff', padding: '10px 0'}}> {_class.name}</div>)}
                            <a href="#" onClick={() => {this.setState({filterStudent : _student.id})}}>{_student.name}</a>
                            </Col>
                            <Col xs={12}>
                            {_index === 0 && (<div style={{background: '#edf7ff', padding: '10px 0'}}>{_lang('form.amount_completed')}</div>)}
                            {_student.done} / {_student.count}
                            </Col>
                        </Col>
                    </Row>
                    ))}
                  </div>
                </Col>
            ))}
          </Row>
          <div className="studentEdit" style={{maxHeight: '70vh', overflow: 'auto'}}>
            {(SUPPORT_SCHOOL.indexOf(merchantID) < 0 || !!filterStudent || !!filterCourse) && (<Table
              columns={reportColumn}
              rowKey={record => `${record.id}-${record.course_id}`}
              dataSource={report.filter(_report => {
                  if(!filterStudent && !filterCourse) {
                      return true;
                  }
                  var _filterStudent = !!filterStudent ? filterStudent.toString() : '';
                  var _filterCourse = !!filterCourse ? filterCourse.toString() : '';
                  if(!!_filterStudent && !!_filterCourse){
                    return _report.id.toString() === _filterStudent && _report.course_id.toString() === _filterCourse;
                  } else {
                    return _report.id.toString() === _filterStudent || _report.course_id.toString() === _filterCourse;
                  }
              })}
              pagination={false}
              loading={!!$$getReport}
              scroll={{ x : 'max-content'}}
            />)}
          </div>
          </Spin>
        </div>
      </div>
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


export default connect(mapStateToProps)(Form.create()(Coursereport));
