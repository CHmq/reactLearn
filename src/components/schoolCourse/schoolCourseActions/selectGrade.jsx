import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import intl from "react-intl-universal";

import { TreeSelect } from 'antd';

import school from "components/services/school";

import { getListAction } from "components/actions/schoolCourse_action";

const { SHOW_PARENT } = TreeSelect;

const SelectGrade = () => {
  const dispatch = useDispatch();
  const { course_id } = useParams();

  const [ classTree, setClassTree ] = useState();

  const { translations, route } = useSelector(state => state);
  const { currentLocation } = route;

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const getClassList = async () => {
    const getClass = school.getClassTree(currentLocation);
    let gList = await getClass;
    setClassTree(gList.classTree);
  };

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

  useEffect(() => {
    getClassList();
  }, [])

  return (
    <TreeSelect
      treeData={classTree}
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
  )
}

export default SelectGrade;