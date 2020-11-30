import React, { Component } from "react";
import { Row, Col, Skeleton } from "antd";
import { connect } from "react-redux";

import Card from "components/common/Card";
import Banner from "components/common/Banner";

import EVICourse from "components/course/CourseTemplate";
import CourseList from "components/course/CourseList";

class Content extends Component {
  $$mount = false;
  $$comment = null;
  $$course = {
    current: {
      isLoading: () => true
    }
  };
  state = {
    course: {
      id: null,
      banner: null,
      logo: null,
      name: null,
      video: null,
      school_id: null
    }, //banner数据
    bannerData: [],
    sectionList: [],
    urlId: "",
    skeleton: false,
    language: {}, // 翻译

    $$loading: false,
    cousreID: null,
    offset: 0,
    limit: 50,
    result: [],
    total: 0,
    changed: 0,

    staffPermit: {
      update: false
    }
  };

  constructor(props) {
    super(props);
    this.$$comment = React.createRef();
    this.$$course = React.createRef();
  }

  componentDidMount = async () => {
    this.$$mount = true;
    if (!this.$$mount) {
      return;
    }
    this.props.updateFileName("home");
  };

  componentWillUnmount = async () => {
    this.$$mount = false;
  };

  isLoading = () => {
    let loading = !!this.$$course.current
      ? this.$$course.current.isLoading()
      : true;
    return loading;
  };

  render() {
    console.log(this.props.$language);
    const { course: { name, description, id, lang_info, school_id } } = this.state;
    const styleCss = {
      background: {
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundImage: `url(${this.state.course.background})`
      }
    };

    const comment = null;
    const permitUpdate = this.state.staffPermit.update;
    return (
      <EVICourse
        id="EVI-Course"
        style={{ position: "relative" }}
        staffPermitCallback={permit => {
          if (this.$$mount) this.setState({ staffPermit: permit });
        }}
        getInfo={info => {
          document.documentElement.scrollTop = document.body.scrollTop = 0;
          if (this.$$mount) this.setState({ course: info });
        }}
        getList={({ total, rows }) => {
          if (this.$$mount) this.setState({ total, rows });
        }}
        getSectionList={list => {
          if (this.$$mount) this.setState({ sectionList: list });
        }}
        courseID={this.props.match.params.course_id}
        ref={this.$$course}
        changed={this.state.changed}
      >
        <Row>
          <Skeleton loading={!!this.isLoading()} active paragraph={{ rows: 8 }}>
            <Banner img={this.state.course.banner} height={"325px"} />
          </Skeleton>
        </Row>
        <Row type="flex" justify="center" style={styleCss.background}>
          <Col
            xs={22}
            md={24}
            style={{ marginTop: "1rem", maxWidth: "1200px" }}
          >
            <Col xs={24} md={8} lg={6} xl={6} style={{ padding: "0 1rem" }}>
              <Card
                width="100%"
                title={name}
                html={description}
                urlId={id}
                langInfo={lang_info}
                schoolId={school_id}
                manage={permitUpdate}
                updateData={() => this.$$course.current.getCourse()}
              />
              <Col xs={0} md={24}>
                {comment}
              </Col>
            </Col>
            <Col
              xs={24}
              md={{ span: 16, offset: 0 }}
              lg={{ span: 18, offset: 0 }}
              style={{ padding: "0" }}
            >
              <CourseList
                page="info"
                noBackground={true}
                sectionList={this.state.sectionList}
                EVICourse={this.$$course}
                dashboard
                grade={this.state.course.grade}
                $language={this.props.$language}
                setChange={() => this.setState({ changed: this.state.changed + 1 })}
              />
            </Col>

            <Col xs={24} md={0} lg={0}>
              {comment}
            </Col>
          </Col>
        </Row>
      </EVICourse>
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

export default connect(mapStateToProps)(Content);
