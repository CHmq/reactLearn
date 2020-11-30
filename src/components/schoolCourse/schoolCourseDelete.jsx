import React from 'react';
import { useSelector } from 'react-redux';
import intl from "react-intl-universal";
import { Modal, Icon } from 'antd';

const SchoolCourseDelete = (props) => {
  const { title, content, onOk, isFun } = props;

  const { translations } = useSelector(state => state);

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }
  
  const handledelete = () => {
    Modal.confirm({
      title,
      icon: <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />,
      content,
      confirmLoading: true,
      onOk,
      okText: lang(`general.button.confirm`),
      cancelText: lang(`general.button.cancel`)
    });
  };


  return isFun ? handledelete : (
    <div onClick={handledelete}>
      {props.children}
    </div>
  );
}

export default SchoolCourseDelete;