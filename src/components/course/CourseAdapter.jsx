import React, { useState,  useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from "react-router";

import { getInfoAction, getListAction } from "components/actions/schoolCourse_action";

import EVILoader from "components/spinner/Loader";
import Course from "components/Course";
import SchoolCourse from "components/schoolCourse";

const CourseAdapter = (props) => {
  const dispatch = useDispatch();

  const { info } = useSelector(state => state.schoolCourse);

  const [ loading, setLoading ] = useState(false);

  const courseId = props.match.params.course_id;

  useMemo(() => {
    if(courseId) {
      setLoading(true);
      dispatch(
        getInfoAction(courseId, () => {
          setLoading(false);
        })
      );
    }
  }, [courseId]);


  return (
    <>
    {
      loading &&
      (<div style={{minHeight: 500, display: 'flex', alignItems: 'center'}}>
        <EVILoader loading={true} />
      </div>)
    }
    {
      !loading && info && info.school_id === "1" && (<Course />)
    }
    {
      !loading && info && info.school_id !== "1" && (<SchoolCourse />)
    }
    </>
  )
}

export default CourseAdapter;
