import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import intl from "react-intl-universal";
import { Row, Col, Button, message, Divider } from 'antd'

import courseService from "components/services/courseService";

import EVIResource from "./EVIResource";
import SchoolResource from "./schoolResource";

const VideoLibrary = ( props ) => {
  const { translations } = useSelector(state => state);
  const { id, isEviOnly, onRefresh, maxNum } = props;

  const [ selected, setSelected ] = useState([]); // 已選擇的 video item
  const [ loading, setLoading ] = useState(false); // submit loading

  const _lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  // video 全選/全不選
  const handleSelectAllVideo = (list, e) => {
    const checked = e.target.value === 'Y';
    const data = JSON.parse(JSON.stringify(selected));
    
    const ret = list.filter(item => {
      const find = data.findIndex(_ => _.id === item.id);
      !checked && find > -1 && data.splice(find, 1);
      return find === -1;
    })
    if(ret.length > maxNum - data.length && checked) {
      message.warning(_lang('course_1.content.PopupAECoursware.maxNum_tip'));
      return;
    }
    const newData = checked ? [...data, ...ret] : data;
    setSelected(newData);
  }

  // 增減 video item
  const handleSelectVideo = (item) => {
    const { id, lang, vo_lang } = item;
    const data = JSON.parse(JSON.stringify(selected));
    const index = data.findIndex(select => {
      // 加这个判断是因为 学校影片 没有 lang 和 vo_lang
      return isEviOnly ? 
        select.id === id && select.lang === lang && select.vo_lang === vo_lang : 
          select.id === id 
    });
     // 增加 video 最大个数限制为 10
    if(selected.length >= maxNum && index === -1) {
      message.warning(_lang('course_1.content.PopupAECoursware.maxNum_tip'));
      return;
    }
    index > -1 ? data.splice(index, 1) : data.push(item);
    setSelected(data);
  }

  // 提交
  const onSubmit = () => {
    // 重新定义 post 所需格式
    const items = selected.map((item, index) => (
      { 
        lang: item.lang || 'zh',
        vo_lang: item.vo_lang || 'CANTONESE',
        adapter_type: isEviOnly ? 'EVI' : 'SCHOOL',
        adapter_item_id: item.id,
        sort: index + 1
      }
    ))
    setLoading(true);
    if(id && items.length) {
      courseService.adapterBatchAdd(id, items).then(ret => {
        typeof onRefresh === 'function' && onRefresh();
      }).finally(() => {
        setLoading(false);
      })
    }
  }

  return (
    <>
      {isEviOnly ? (
        <EVIResource 
          selected={selected}
          onSelectVideo={(item) => handleSelectVideo(item)}
          onSelectAllVideo={(list, checked) => handleSelectAllVideo(list, checked)}
        />
      ) : (
        <SchoolResource
          selected={selected}
          onSelectVideo={(item) => handleSelectVideo(item)}
        />
      )}
      <Row>
        <Col xs={24} style={{textAlign: 'center'}}>
          <Divider />
          <Button 
            type="primary" 
            onClick={onSubmit}
            disabled={!selected.length}
            loading={loading}
          >
            {_lang("articleInfo.btn")}
          </Button>
        </Col>
      </Row>
    </>
  )
}

export default VideoLibrary;