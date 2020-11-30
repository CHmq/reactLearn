import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import intl from "react-intl-universal";
import InfiniteScroll from "react-infinite-scroller";
import { Input, Spin, Icon, Row, Col, Empty, Select, Radio } from 'antd'

import courseService from "components/services/courseService";
import main from "components/services/mainService";
import { RESOURCE } from "config/course.json";

import styles from 'assets/css/MixVideoSort.module.scss';

import ResourceItem from "./resourceItem";
import VideoItem from "./videoItem";

const { Search } = Input;
const { Option } = Select;

const langConfig = [
  { value: '繁(廣東話)', lang: 'zh-CANTONESE' },
  { value: '繁(普通話)', lang: 'zh-PUTONGHUA' },
  { value: 'ENG', lang: 'english-ENGLISH' },
  { value: '簡', lang: 'cn-PUTONGHUA' }
]

const EVIResource = ( props ) => {
  let isMount = useRef(false);
  const { translations } = useSelector(state => state);
  const { selected, onSelectVideo, onSelectAllVideo } = props;

  const [ page, setPage ] = useState(0); // 滑動加載頁數
  const [ list, setList ] = useState({ total: 0, rows: [] }); // 課件資料
  const [ videoList, setVideoList ] = useState({ total: 0, rows: [] }); // video 列表資料
  const [ fullInfo, setFullInfo ] = useState({ item: [] }); // 課件詳情資料
  const [ keyword, setkeyword ] = useState(''); // 搜尋 value
  const [ loading, setLoading ] = useState(false); // 課件 api loading
  const [ infoLoading, setInfoLoading ] = useState(false); // 課件詳情 api loading
  const [ resourceLang, setResourceLang ] = useState('zh-CANTONESE');  // 左側 資源 列表語言
  const [ videoListLang, setVideoListLang ] = useState({});  // 右側 video 列表語言
  
  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const getList = (offset=0) => {
    const itemList = [...RESOURCE[0].split(","), 'video'];
    const [ lang, vo_lang ] = resourceLang.split("-");
    const params = {
      keyword, 
      type: itemList, 
      offset, 
      limit: 12, 
      show_total: true, 
      evi_only: true,
      lang,
      vo_lang
    }
    setLoading(true);
    let ret = courseService.search(params).then(ret => ret)
      .catch(() => ({ total: 0, rows: [] }))
        .finally(() => {
          isMount.current && setLoading(false);
        })
    return ret;
  }
  // 獲取課件詳情
  const getFullInfo = (id, adapter_type) => {
    if(id === fullInfo.id) {
      return;
    }
    setInfoLoading(true);
    main.getFullInfo(id).then(ret => {
      const [ firtItem={} ] = ret.item;
      const [ firstLang={} ] = firtItem.lang; // ret lang第一個資料的lang
      const [ lang, vo_lang ] = resourceLang.split("-"); // 下拉選框的 lang
      // 用於判斷是否有符合 lang 下拉選框的資料
      const list = ret.item.reduce((arr, item) => {
        const filter = item.item_type === 'video' ? 
          item.lang.filter(_ => _.lang === lang && _.vo_lang === vo_lang) : [];
        return arr.concat(filter);
      }, []);
      if(isMount.current) {
        ret.adapter_type = adapter_type;
        setFullInfo(ret);
        if(!!list.length) {
          setVideoList(list);
          return;
        }
        // 如果沒有符合 lang 下拉選框的資料。就預設 lang 第一項的資料
        setVideoListLang({
          lang: firstLang.lang,
          vo_lang: firstLang.vo_lang
        })
      }
    }).catch(() => ({ item: [] })).finally(() => {
      isMount.current && setInfoLoading(false)
    })
  }

  const handleGetInfo = (item) => {
    getFullInfo(item.id, item.adapter_type);
  }

  const handleChangeResourceLang = (value) => {
    setResourceLang(value);
  }

  // 選擇語言 filter 資料
  const handleLangFilger = (id, lang, vo_lang) => {
    if(id !== fullInfo.id) return;
    setVideoListLang({lang, vo_lang});
  }

  useEffect(() => {
    isMount.current = true;
    return () => {
      isMount.current = false;
    }
  }, [])

  // 滑动加载
  const handleInfiniteOnLoad = () => {
    if(!loading) {
      setPage(() => page + 1);
    }
  }
  // 滑動加載 page 更新時執行
  useEffect(() => {
    if(page) {
      getList(page).then(ret => {
        const newList = {
          total: ret.total,
          rows: list.rows.concat(ret.rows)
        }
        isMount.current && setList(newList);
      });
    }
  }, [page])

  // 组件第一次渲染、lang改變以及搜寻获取资料
  useEffect(() => {
    getList().then(ret => {
      if(isMount.current) {
        setList(ret);
      }
      const [ firstItem={} ] = ret.rows;
      // 默认获取第一项的课件详情
      getFullInfo(firstItem.id, firstItem.adapter_type);
    });
    setPage(0);
    setFullInfo({item : []});
  }, [keyword, resourceLang])

  // 根據語言篩選出 videoList 資料
  useEffect(() => {
    // 從課件詳情 filter 出與 lang 匹配 video 資料
    const list = fullInfo.item.reduce((arr, { item_type, lang }) => {
      const filter = item_type === 'video' ? 
        lang.filter(_ => _.lang === videoListLang.lang && _.vo_lang === videoListLang.vo_lang) : [];
      return arr.concat(filter);
    }, [])
    setVideoList(list);
  }, [videoListLang])

  return (
    <Row gutter={[20, 20]} className={styles.videoStore}>
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
        <Select 
          value={resourceLang} 
          onChange={handleChangeResourceLang} 
          style={{ width: 120, margin: '10px 0' }}
        >
          {langConfig.map(item => (
            <Option key={item.lang} value={item.lang}>
              {item.value}
            </Option>
          ))}
        </Select>
        {/* 課件列表 */}
        <div className={styles.resourceListWrap}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={handleInfiniteOnLoad}
            hasMore={list.rows.length < list.total && !loading}
            useWindow={false}
          >
            <Row gutter={[10, 10]}>
              {list.rows.map(item => (
                <Col key={item.id} xs={6}>
                  <ResourceItem 
                    data={item}
                    onGetInfo={() => handleGetInfo(item)}
                    onLangFilter={handleLangFilger}
                    active={item.id === fullInfo.id}
                  />
                </Col>
              ))}
            </Row>
          </InfiniteScroll>
        </div>
      </Col>
      {/* video item 列表 */}
      <Col xs={6} className={styles.videoListWrap}>
        {infoLoading ? (
          <div className={styles.loading}>
            <Icon type="loading" style={{fontSize: 24}} />
          </div>
        ) : (
          !!videoList.length ? (
            <Row gutter={[10, 10]} className={styles.videoList}>
              <Col xs={24}>
                <Radio.Group onChange={(e) => onSelectAllVideo(videoList, e)}>
                  <Radio value="Y">{lang('general.button.select_all')}</Radio>
                  <Radio value="N">{lang('general.button.unselect_all')}</Radio>
                </Radio.Group>
              </Col>
              {videoList.map(item => (
                <Col key={item.id} xs={24}>
                  <VideoItem
                    data={item}
                    active={selected.some(_ => 
                      _.id === item.id && _.lang === item.lang && _.vo_lang === item.vo_lang
                    )}
                    onSelectVideo={() => onSelectVideo(item)}
                  />
                </Col>
              ))}
            </Row>
          ) : <Empty description={lang("course_1.content.PopupAECoursware.noVideo")} />
        )}
      </Col>
    </Row>
  )
}

export default EVIResource;