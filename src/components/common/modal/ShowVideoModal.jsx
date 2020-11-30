import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getFullDisplayInfoAction } from "components/actions/main_action";

import { Drawer, Row, Col } from "antd";
import Video from "components/common/Video";

import styles from "assets/css/new/showVideoModal.module.scss";

const ShowVideoModal = (props) => {
  const { visible, id, onCancel } = props;

  const dispatch = useDispatch();

  const full_info = useSelector((state) => state.main.full_info);

  const { name, item } = full_info;

  const [ videoIdx, setVideoIdx ] = useState(0);

  const [ played, setPlayed ] = useState([0]);

  const [ autoplay, setAutoplay ] = useState(false);

  const init = () => {
    setVideoIdx(0);
    setPlayed([0]);
    setAutoplay(false);
  }

  const data = useMemo(() => {
    return item.filter(item => item.item_type === "video")
  }, [item])

  useEffect(() => {
    // 已播放視頻 箭頭變成紅色
    const find = played.includes(videoIdx);
    if(!find) {
      setPlayed([...played, videoIdx]);
    }
  }, [videoIdx])

  useEffect(() => {
    if(visible) {
      dispatch(getFullDisplayInfoAction(id));
    } else {
      init();
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (autoplay) {
      const flag = videoIdx + 1 < data.length;
      setVideoIdx(flag ? videoIdx + 1 : 0);
      setAutoplay(false);
    }
  }, [autoplay]);

  return (
    <Drawer
      title={name}
      placement="bottom"
      onClose={onCancel}
      visible={visible}
      height="100%"
      headerStyle={{backgroundColor: '#ff5287', borderRadius: 'unset', color: '#fff'}}
      destroyOnClose
    >
      <div className={styles.wrap}>
        <div className={styles.inner}>
          {data.map((item, index) => (
            <div key={index} className={styles.imgWrap}>
              <div 
                className={`
                  ${played.includes(index) ? styles.arrowRed : ''}
                  ${styles.arrow} 
                  ${videoIdx === index ? styles.arrowMove : ''}
                `
                } 
              />
              <img
                src={`${item.file}?x-oss-process=video/snapshot,t_1000,f_jpg,m_fast`}
                alt=""
                onClick={() => setVideoIdx(index)}
              />
            </div>
          ))}
        </div>
        <Row>
          {!!item.length && (
            <Col>
              <Video
                videosrc={(item[videoIdx] || {}).streaming_url || (item[videoIdx] || {}).file}
                light={false}
                onEndEnable={true}
                setAutoplay={setAutoplay}
              />
            </Col>
          )}
        </Row>
      </div>
    </Drawer>
  );
};

export default ShowVideoModal;
