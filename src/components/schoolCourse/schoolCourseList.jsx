import React, { useState } from 'react';
import { useSelector } from "react-redux";
import intl from "react-intl-universal";
import { Row, Col, Button } from 'antd';
import QueueAnim from "rc-queue-anim";

import SchoolCourseItem from './schoolCourseItem';

import progressIcon from "assets/image/schoolCourse/progress_icon.png";
import soonIcon from "assets/image/schoolCourse/soon_icon.png";
import finishIcon from "assets/image/schoolCourse/finish_icon.png";

import style from 'assets/css/schoolCourse.module.scss';

const styles = {
  inner: {
    maxWidth: 1500, 
    margin: '0 auto'
  },
  title: {
    fontSize: 36, 
    fontWeight: 'bold', 
    margin: 0, 
    lineHeight: '95px'
  } 
}

const SchoolCourseList = (props) => {
  const { translations } = useSelector(state => state);
  const { type, data } = props;

  const [ limit, setLimit ] = useState(10);

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  };

  const config = {
    PROGRESS: { title: lang("schoolCourse.title_progress"), background: '#d9e8ff', color: '#0a5784', icon: progressIcon },
    SOON: { title: lang("schoolCourse.title_soon"), background: '#ffffff', color: '#fb5151', icon: soonIcon },
    FINISH: { title: lang("schoolCourse.title_finish"), background: '#f5f5f5', color: '#78bc00', icon: finishIcon }
  }

  const { title, background, color, icon } = config[type];

  return (
    <div className={style.schoolCourseList} style={{ background }} hidden={!data.length}>
      <Row type='flex' gutter={28} className={style.inner}>
        <Col xs={24}>
          <h1 style={{ ...styles.title, color }}>
            <img src={icon} style={{width: 40, verticalAlign: 'sub', marginRight: 18}} alt="icon"/>
            {title}
          </h1>
        </Col>
        <QueueAnim
          className="ant-row-flex ant-row-flex-middle"
          type="scale"
          interval={60}
          duration={600}
          style={{width: '100%'}}
          ease={["easeInOutElastic"]}
        >
          {data.map((item, index) => {
            return index < limit ? (
              <Col 
                key={item.id}
                xl={4} lg={6} md={8} sm={12} xs={24} 
                className={style.courseItem}
              >
                <SchoolCourseItem data={item} />
              </Col>
            ) : ''
          })}
        </QueueAnim>
        <Col xs={24} style={{marginBottom: 28, textAlign: 'center'}}>
          {data.length > 10 && (
            <Button 
              type="link" 
              onClick={() => setLimit(() => data.length > limit ? limit + 10 : 10)}
            >
              {data.length > limit ? lang("schoolCourse.btn_more") : lang("schoolCourse.btn_retract")}
            </Button>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default SchoolCourseList;