import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import { withRouter } from "react-router";
import intl from "react-intl-universal";
import { Row, Col } from "antd";

import { getListAction, getClassAction } from "components/actions/schoolCourse_action";

import user_API from "components/services/userService";

import EVILoader from "components/spinner/Loader";
import Banner from "./banner";
import SchoolCourseFilter from "./schoolCourseFilter";
import SchoolCourseActions from "./schoolCourseActions";
import SchoolCourseList from "./schoolCourseList";

const SchoolCourse = () => {
  const dispatch = useDispatch();
  const { course_id } = useParams();

  const { route: { currentLocation }, schoolCourse: { info, list }, translations } = useSelector(state => state);
  
  const [ listLoading, setListLoading ] = useState(false);
  const [ order, setOrder ] = useState("all");
  const [ type, setType ] = useState("all");

  useEffect(() => {
    if(user_API.getType() === "STAFF") {
      dispatch(getClassAction(currentLocation, info.grade));
    }
  }, [info.grade]);

  useEffect(() => {
    if (course_id) {
      setListLoading(true);
      const params = {
        id: course_id,
        sort: order === "all" ? undefined : "publish_time",
        order: order === "all" ? undefined : order,
        callback() {
          setListLoading(false);
        },
      };
      dispatch(getListAction(params));
    }
  }, [course_id, order]);

  const newList = useMemo(() => {
    return list.rows.filter((item) => {
      const ret = {
        all: item,
        COURSE: item.type === type,
        project: item.res_type === type,
        video: !["COURSE", "project"].includes(item.res_type || item.type),
      };
      return ret[type];
    });
  }, [type, list.rows]);

  const typeList = useMemo(() => {
    return list.rows.reduce((acc, item) => {
      const type = item.res_type || item.type;
      const newType = ["COURSE", "project"].includes(type) ? type : "video";
      if (!acc.includes(newType)) {
        acc.push(newType);
      }
      return acc;
    }, []);
  }, [list.rows]);

  return (
    <div>
      <Banner />
      {listLoading ? (
        <div style={{ minHeight: 500, display: "flex", alignItems: "center" }}>
          <EVILoader loading={true} />
        </div>
      ) : (
        <>
          <Row
            type="flex"
            align="middle"
            gutter={50}
            style={{ maxWidth: 1450, margin: "0 auto" }}
          >
            <Col xxl={14} xs={24}>
              <SchoolCourseFilter
                selectValue={order}
                typeList={typeList}
                onSelectOrder={(value) => setOrder(value)}
                onSelectType={(value) => setType(value)}
              />
            </Col>
            {user_API.getType() === "STAFF" && (
              <Col xxl={10} xs={24}>
                <SchoolCourseActions />
              </Col>
            )}
          </Row>
          {newList.length ? ["PROGRESS", "SOON", "FINISH"].map((item, index) => (
            <SchoolCourseList
              key={item + index}
              type={item}
              data={newList.filter((_) => _.publish_status === item)}
            />
          )) : (
            <h2 style={{textAlign: 'center', marginTop: '5rem'}}>
              {translations.initDone && intl.get("schoolCourse.msg_noData")}
            </h2>
          )}
        </>
      )}
    </div>
  );
};

export default withRouter(SchoolCourse);
