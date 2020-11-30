import React, { memo, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import intl from "react-intl-universal";
import { Row, Col, Icon, Button } from 'antd';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import videoBg from 'assets/image/schoolCourse/video_bg.png';

import styles from 'assets/css/MixVideoSort.module.scss';

import mainService from "components/services/mainService";

import Video from "components/common/Video";
import SelectVideoModal from './selectVideoModal';

const MixVideoSort = memo(( props ) => {
  const { id, URLid, list, onDeleteItem, onRefresh, onClose } = props;

  const { initDone } = useSelector(state => state.translations);

  const [ data, setData ] = useState([]);
  const [ active, setActive ] = useState({}); // 當前播放視頻
  const [ loading, setLoading ] = useState(false); // 更新排序 loading

  const lang = (value) => {
    return initDone && intl.get(value);
  }

  useEffect(() => {
    setData(list);
    // 判斷當前播放的視頻是否被刪除
    if(list.every(_ => _.id !== active.id)) {
      setActive({});
    }
  }, [list])

  // 判断是否有类型为 EVI 的资料
  const isEviOnly = useMemo(() => data.every(_ => _.adapter_type !== 'EVI'), [data]);

  const SortableItem = SortableElement(({ item, index }) => (
    <Col xs={4} className={styles.sortItemWrap}>
      <div style={{ position: 'relative', padding: 15, height: 107, background: `url(${videoBg})`,}}>
        <img
          src={item.file + "?x-oss-process=video/snapshot,t_1000,f_jpg,m_fast"} 
          alt="課件封面圖"
          style={{width: '100%', height: 77, objectFit: 'cover'}}
        />
        <Button
          icon="caret-right"
          shape="circle"
          style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
          onClick={() => setActive(item)}
        />
        <Button 
          size="small"
          icon="close"
          className={styles.deleteBtn}
          style={{position: 'absolute', top: 5, right: 5, color: 'red'}}
          onClick={(e) => onDeleteItem("deleteItem", item.id, e)}
        />
      </div>
    </Col>
  ))

  const SortableList = SortableContainer(({ items }) => (
    <Row 
      type='flex' 
      gutter={[10, 10]}
      justify="start"
    >
      {items.map((item, index) => (
        <SortableItem
          key={item.id}
          index={index}
          item={item}
          disabled={false}
        />
      ))}
      {data.length < 10 && (
        <Col xs={4} className={styles.sortItemWrap}>
          <SelectVideoModal 
            id={id} 
            URLid={URLid} 
            onRefresh={onRefresh}
            isEviOnly={isEviOnly}
            maxNum={10 - data.length}
          >
            <div className={styles.plusIcon}>
              <Icon type="plus-circle" style={{fontSize: 45, color: '#ccc'}} />
            </div>
          </SelectVideoModal>
        </Col>
      )}
    </Row>
  ))
  // 拖拽結束
  const onSortEnd = ({ oldIndex, newIndex }) => {
    setData(() => arrayMove(
      data,
      oldIndex,
      newIndex
    ));
  }
  // 提交更新排序
  const onSubmit = async() => {
    const items = data.map((item, index) => ({
      item_id: item.id,
      sort: index + 1
    }))
    setLoading(true);
    try {
      await mainService.updateSort(id, items);
      onRefresh(id);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const videoSrc = useMemo(() => {
    const [ firstItem={} ] = data;
    // 如果還未選擇視頻，就默認選擇第一個視頻
    return (active.streaming_url || active.file) || (firstItem.streaming_url || firstItem.file );
  }, [active, data])

  return (
    <Row type="flex" justify="center" gutter={[0, 20]}>
      {!!data.length && (
        <Col xs={20}>
          <Video videosrc={videoSrc} playing={false} light={false} />
        </Col>
      )}
      <Col xs={24} className={styles.sortWrap}>
        <p className={styles.tip}>{lang('course_1.content.PopupAECoursware.video_tip')}</p>
        <div className={styles.sortList}>
          {/* 排序列表 */}
          <SortableList
            axis="xy"
            // pressDelay={200}
            items={data}
            helperClass="cousre-item-sortable"
            onSortEnd={onSortEnd}
          />
        </div>
      </Col>
      <Col xs={24} style={{display: "flex", justifyContent: "space-evenly"}}>
        <Button type='primary' onClick={onSubmit} loading={loading}>
          {lang('course_1.content.PopupAECoursware.update_sort')}
        </Button>
        <Button type='primary' onClick={() => {
          onSubmit();
          onClose();
        }}>
          {lang('general.button.done')}
        </Button>
      </Col>
    </Row>
  )
})

MixVideoSort.defaultProps = {
  list: []
}

MixVideoSort.propTypes = {
  list: PropTypes.array.isRequired
}

export default MixVideoSort;