import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import intl from "react-intl-universal";
import { Avatar, Menu, Dropdown } from 'antd';

import styles from 'assets/css/MixVideoSort.module.scss';

import Resource from "components/course/Resource";

const langConfig = [
  {lang: 'zh'},
  {lang: 'english', vo_lang: 'ENGLISH'},
  {lang: 'cn', vo_lang: 'PUTONGHUA'},
]

const ResourceItem = memo(( props ) => {
  const { translations } = useSelector(state => state);
  const { data, onGetInfo, onLangFilter, active } = props;

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }
  // language 按鈕 filter 資料
  // const handleClick = ({ key }) => {
  //   onLangFilter(data.id, 'zh', key);
  // }
  
  // 功能只是暂时收起，不要删
  // const menu = (
  //   <Menu onClick={handleClick}>
  //     <Menu.Item key="CANTONESE">廣東話</Menu.Item>
  //     <Menu.Item key="PUTONGHUA">普通話</Menu.Item>
  //   </Menu>
  // );

  return (
    <div 
      className={styles.resourceItem} 
      style={{border: `2px solid ${active ? 'red' : '#ccc'}`}}
    >
      <Resource
        picUrl={data.file}
        title={data.name}
        titleFontSize="12px"
        titleBgcolor={"rgba(0, 0, 0, 0.5)"}
        onClick={onGetInfo}
      />
      <div>
        <div>
          {(data.grade || []).map((ret, index) => (
            <Avatar
              className={styles.gradeIcon}
              key={index}
            >
              {ret}
            </Avatar>
          ))}
        </div>
        <Avatar className={styles.typeIcon}>
          {(lang(`home.publicMsg.resource_type.${data.type}`) || data.type)[0]}
        </Avatar>
        {langConfig.map(_lang => {
          return (
            (data.lang || []).filter(
              (_res) => _res.lang.toString() === _lang.lang
            ).length > 0 && (
              // 功能只是暂时收起，不要删
              // <Dropdown
              //   key={`${data.id.toString()}-${_lang.lang.toString()}`}
              //   overlay={menu} 
              //   trigger={['click']} 
              //   disabled={_lang.lang !== 'zh'}
              //   placement="topCenter"
              // >
                <Avatar
                  className={styles.langIcon}
                  // 功能只是暂时收起，不要删
                  // onClick={() => {
                  //   if(_lang.lang === 'zh') return;
                  //   onLangFilter(data.id, _lang.lang, _lang.vo_lang);
                  // }}
                >
                  {lang(`general.lang.${_lang.lang}`) || _lang.lang}
                </Avatar>
              // </Dropdown>
            )
          );
        })}
      </div>
    </div>
  )
});

ResourceItem.propTypes = {
  data: PropTypes.object.isRequired,
  onGetInfo: PropTypes.func.isRequired, 
  onLangFilter: PropTypes.func.isRequired
}

export default ResourceItem;