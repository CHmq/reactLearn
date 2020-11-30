import React from "react";
import { useSelector } from "react-redux";
import { Modal, message } from "antd";
import UploadingFile from "components/common/UploadingFile";
import intl from "react-intl-universal";

import { setDefaultPreviewImg } from "components/services/mainService";

// 校本资料 上传封面
const CourseEditPreviewImg = (props) => {
  // item 當前項的數據
  const { visible, setVisible, item, updateCallback } = props;

  const translations = useSelector((state) => state.translations);

  // 上传预设封面图
  const apiFunDefaultBg = async (bgIndex) => {
    try {
      await setDefaultPreviewImg(item.id, bgIndex);
      updateCallback();
      message.success(
        translations.initDone && intl.get(`general.msg.update_success`),
        () => setVisible()
      );
    } catch (error) {
      console.log(error);
      message.error(
        translations.initDone && intl.get(`general.msg.update_error`)
      );
    }
  };

  return (
    <Modal
      title={translations.initDone && intl.get(`course_1.content.ModalTitle`)}
      centered
      bodyStyle={{ backgroundColor: "#fff" }}
      visible={visible}
      onCancel={() => setVisible()}
      footer={null}
      maskClosable={false}
      destroyOnClose={true}
    >
      <UploadingFile
        aspectRatio={4 / 3}
        URLid={item.id}
        type="schoolResouce_preview"
        bgId={item.bg_id}
        onCancel={() => setVisible()}
        apiFun={(bgIndex) => apiFunDefaultBg(bgIndex)}
        updateCallback={updateCallback}
      />
    </Modal>
  );
};

export default CourseEditPreviewImg;
