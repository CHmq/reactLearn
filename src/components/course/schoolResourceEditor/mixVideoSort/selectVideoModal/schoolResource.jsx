import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import intl from "react-intl-universal";
import InfiniteScroll from "react-infinite-scroller";
import { Row, Col, Input, Spin, Icon } from 'antd';

import schoolService from "components/services/school";

import VideoItem from "./videoItem";

const { Search } = Input;

const SchoolResource = ( props ) => {
  let isMount = useRef(false);
  const { selected, onSelectVideo } = props;
  const { translations } = useSelector(state => state);
  
  const [ list, setList ] = useState({ total: 0, rows: [] }); // 課件資料
  const [ keyword, setkeyword ] = useState(''); // 搜尋 value
  const [ loading, setLoading ] = useState(false); // video api loading
  const [ page, setPage ] = useState(0); // 滑動加載頁數

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const getVideoList = (offset) => {
    setLoading(true);
    return schoolService.getVideoList(offset, 12, keyword).then(ret => ret)
      .catch(() => ({ total: 0, rows: [] }))
        .finally(() => {
          isMount.current && setLoading(false);
        })
  }

  // 滑动加载
  const handleInfiniteOnLoad = () => {
    if(!loading && isMount.current) {
      setPage(() => page + 1);
    }
  }

  useEffect(() => {
    isMount.current = true;
    console.log('willMount');
    return () => {
      isMount.current = false;
      console.log('willUnMount');
    }
  }, [])

  useEffect(() => {
    if(page) {
      getVideoList(page).then(ret => {
        const newList = {
          total: ret.total,
          rows: list.rows.concat(ret.rows)
        }
        isMount.current && setList(newList);
      });
    }
  }, [page])
  // 组件第一次渲染以及搜尋获取资料
  useEffect(() => {
    getVideoList(0).then(ret => {
      isMount.current && setList(ret);
    })
    setPage(0);
  }, [keyword])

  return (
    <Row gutter={[20, 20]}>
      <Col xs={18}>
        <Search
          placeholder={lang("course_1.content.PopupAECoursware.search_placeholder")}
          onSearch={keyword => setkeyword(keyword)}
          allowClear
          enterButton={loading ? (
            <Spin
              indicator={
                <Icon
                  type="loading"
                  style={{ fontSize: 24 }}
                  spin
                />
              }
            />
          ) : (
            true
          )}
          disabled={loading}
          autoFocus
        />
      </Col>
      <Col xs={24}>
        <div style={{ height: 520, overflowY: 'auto', overflowX: 'hidden' }}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={handleInfiniteOnLoad}
            hasMore={list.rows.length < list.total && !loading}
            useWindow={false}
          >
            <Row gutter={[20, 20]}>
              {list.rows.map(item => (
                <Col key={item.id} xs={6}>
                  <VideoItem
                    data={item}
                    active={selected.some(_ => _.id === item.id)}
                    onSelectVideo={() => onSelectVideo(item)}
                  />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        </div>
      </Col>
    </Row>
  )
}

export default SchoolResource;