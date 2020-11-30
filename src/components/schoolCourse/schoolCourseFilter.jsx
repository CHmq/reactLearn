import React from "react";
import { useSelector } from "react-redux";
import intl from "react-intl-universal";
import { useHistory } from "react-router-dom";

import { Row, Col, Select, Menu, Button } from "antd";

import Icon from "./common/icon";

// import styles from "assets/css/schoolCourse.module.scss";

const { Option } = Select;

const SchoolCourseFilter = (props) => {
  const { selectValue, typeList, onSelectOrder, onSelectType } = props;

  const { translations } = useSelector((state) => state);

  const history = useHistory();

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  };

  const handleChange = (newValue) => {
    if (onSelectOrder) onSelectOrder(newValue);
  };

  const handleSelectType = (newValue) => {
    if (onSelectType) onSelectType(newValue);
  };

  const config = {
    COURSE: lang("schoolCourse.type_course"),
    video: lang("schoolCourse.type_video"),
    project: lang("schoolCourse.type_poject"),
  };

  return (
    <Row
      type="flex"
      align="middle"
      gutter={50}
      style={{ fontWeight: "bold", padding: "5px 0" }}
    >
      <Col lg={4}>
        <Button onClick={() => history.goBack()}>{lang("general.button.back")}</Button>
      </Col>
      <Col lg={6} md={8} xs={12}>
        <Select
          value={selectValue}
          style={{ width: "100%" }}
          onChange={handleChange}
        >
          <Option value="all">
            {lang("general.title.courseSort.sortAll")}
          </Option>
          <Option value="ASC">
            {lang("general.title.courseSort.sortASC")}
          </Option>
          <Option value="DESC">
            {lang("general.title.courseSort.sortDESC")}
          </Option>
        </Select>
      </Col>
      <Col lg={14} md={16} xs={12}>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["all"]}
          onSelect={({ key }) => handleSelectType(key)}
          style={{ border : "none" }}
        >
          <Menu.Item key="all">{lang("schoolCourse.type_all")}</Menu.Item>
          {typeList.map((item, index) => (
            <Menu.Item key={item}>
              <Icon type={item} size={50} /> {config[item] || config.video}
            </Menu.Item>
          ))}
        </Menu>
      </Col>
    </Row>
  );
};

export default SchoolCourseFilter;
