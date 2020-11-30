import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import Resource from "components/course/Resource";
import FilePreview from "components/resource/FilePreview"; // 彈框預覽

import styles from 'assets/css/MixVideoSort.module.scss';

const VideoItem = memo(( props ) => {
  const { data, active, onSelectVideo } = props;

  return (
    <div className={styles.videoItem} style={{border: `3px solid ${active ? 'red' : '#ccc'}`}}>
      <Icon
        type={active ? "minus-circle" : "plus-circle"}
        theme="twoTone"
        twoToneColor={active ? "#ff4d4f" : "#52c41a"}
        className={styles.icon}
        onClick={onSelectVideo}
      />
      <FilePreview file={data.streaming_url || data.file} downloadFile={data.file} zIndex={1400}>
        <Resource
          picUrl={data.file + "?x-oss-process=video/snapshot,t_1000,f_jpg,m_fast"}
          title={data.file_name || data.name}
          titleFontSize="12px"
          titleBgcolor={"rgba(0, 0, 0, 0.5)"}
        />
      </FilePreview>
    </div>
  )
})

VideoItem.defaultProps = {
  data: {},
  selected: []
}

VideoItem.propTypes = {
  data: PropTypes.object.isRequired,
  selected: PropTypes.array.isRequired,
  onSelectVideo: PropTypes.func.isRequired
}

export default VideoItem;