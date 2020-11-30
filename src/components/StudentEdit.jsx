//新增课程页面
import React, { Component } from "react";
import { Tabs, Row, Col } from "antd";
import { connect } from "react-redux";
import Coursereport from "./Coursereport";
import intl from "react-intl-universal";

const TabPane = Tabs.TabPane;


class StudentEdit extends Component {

  render() {
    const { title,translations } = this.props;
    const _fn = function(value) {
      return translations.initDone && intl.get("course_1.content.option."+value)
    }
    const Language = {
      tabtitle: _fn("tabtitle")
    }
    return (
      <div className="card-container">
        <Row className="manage-container">
          <Col>
            <h3 className="title">{title}</h3>
          </Col>
          <Col>
            <div className="card-container">
              <Tabs type="card">
                <TabPane tab={Language.tabtitle} key="1">
                  <Coursereport item={this.props.item} iCourseID={this.props.courseId} />
                </TabPane>
              </Tabs>
            </div>
          </Col>
        </Row>
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
function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StudentEdit);
