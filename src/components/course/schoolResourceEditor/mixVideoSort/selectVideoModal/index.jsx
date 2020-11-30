import React, {memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, Tabs } from 'antd';
import intl from "react-intl-universal";

import VideoLibrary from "./videoLibrary"; // 影片庫
import UploadingFile from "components/common/UploadingFile";

const { TabPane } = Tabs;

const SelectVideoModal = memo((props) => {
  const { translations } = useSelector(state => state);
  const { children, URLid, onRefresh, ...rest } = props;

  const [ visible, setVisible ] = useState(false); // modal 開關
  const [ tabActive, setTabActive ] = useState("1");

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const handleOpen = () => {
    setVisible(true);
  }

  const handleClose = () => {
    setVisible(false);
  }

  const handleRefresh = () => {
    typeof onRefresh === 'function' && onRefresh(props.id);
    handleClose();
  }

  const handleTabsChange = (key) => {
    setTabActive(key);
  }

  return (
    <>
      <div onClick={handleOpen}>
        {children}
      </div>
      <Modal
        width={tabActive === "1" ? 950 : 520}
        visible={visible}
        onCancel={handleClose}
        footer={null}
        destroyOnClose
      >
        <Tabs activeKey={tabActive} onChange={handleTabsChange}>
          <TabPane tab={lang("course_1.content.PopupAECoursware.video_tab")} key="1">
            <VideoLibrary 
              {...rest}
              addItemId={URLid}
              onRefresh={handleRefresh}
            />
          </TabPane>
          <TabPane tab={lang("course_1.content.PopupAECoursware.upload_tab")} key="2">
            <UploadingFile
              tip={lang("course_1.UploadingFile.fileTip")}
              URLid={URLid}
              type="adapter"
              onCancel={handleRefresh}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </>
  )
})

export default SelectVideoModal;