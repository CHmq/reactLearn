import React, { useRef, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import intl from "react-intl-universal";
import { Row, Col, TreeSelect, Button } from 'antd';

import { getListAction } from "components/actions/schoolCourse_action";

import LandingPopup from "components/LandingPopup";
import CourseEditor from "components/course/CourseEditor";

const { SHOW_PARENT } = TreeSelect;

const SchoolCourseActions = memo(() => {
  const editRef = useRef();
  const dispatch = useDispatch();
  const { course_id } = useParams();
  const { translations, schoolCourse: { info, class: classData } } = useSelector(state => state);

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const onSelect = (i_select, node, extra) => {
    let _ret = (extra["allCheckedNodes"] || []).map((_select) => {
      if (!_select.pos) {
        return false;
      }
      let level = _select.pos.split("-");
      if (level.length > 2) {
        return (
          (!!_select.children &&
            _select.children.map((_child) => _child.node.props.value)) ||
          _select.node.props.value
        );
      }
      return _select.node.props.value;
    });
    const params = {
      id: course_id,
      grade: [].concat(..._ret).map((__ret) => {
        if (!__ret) {
          return null;
        }
        let map = __ret.split("-");
        return map.length === 3
          ? `dummy-${map[0]}-${map[2]}`
          : `dummy-${__ret}`;
      })
    }
    dispatch(getListAction(params));
  };

  return (
    <Row 
      type='flex'
      align='middle'
      justify="end"
      gutter={{ xs: 10, sm: 20, md: 30, xl: 50}}
      style={{padding: '5px 0'}}
    >
      <Col>
        <TreeSelect
          treeData={classData.classTree}
          filterTreeNode={(_search, node) =>
            !!node.props &&
            !!node.props.title &&
            node.props.title
              .toUpperCase()
              .indexOf(_search.toUpperCase()) > -1
          }
          treeCheckable={true}
          placeholder={lang("course_1.content.option.grade")}
          allowClear={true}
          showCheckedStrategy={SHOW_PARENT}
          showSearch={true}
          onChange={onSelect}
          style={{ minWidth: 120 }}
        />
      </Col>
      <Col>
        <LandingPopup
          type={"studentedit"}
          title={lang("course_1.content.option.studentEdit")}
          width={1600}
          item={{ name: "" }}
          className={"manageModal"}
          zIndex={777}
        />
      </Col>
      <Col>
        <Button 
          onClick={() => {editRef.current.showModal()}}
        >
          {lang("course_1.content.option.calssAdd")}
        </Button>
        <CourseEditor
          forwardedRef={editRef}
          URLid={info.id}
          refresh={() => {
            dispatch(getListAction({id: course_id}));
          }}
        />
      </Col>
    </Row>
  )
})

export default SchoolCourseActions;