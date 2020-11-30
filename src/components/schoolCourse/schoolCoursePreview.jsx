import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import intl from "react-intl-universal";
import { Modal, Button, message, Icon } from 'antd';

import Video from "components/common/Video";

import styles from 'assets/css/schoolCourse.module.scss';

import { getInfoAction } from "components/actions/schoolCourse_action";
import course from "components/services/courseService";

import DraggerImgUploading from "components/common/UploadingFile";

const SchoolCoursePreview = (props) => {
  const dispatch = useDispatch();
  const { course_id } = useParams();
  const { translations } = useSelector(state => state);
  const { info, staffPermit } = useSelector(state => state.schoolCourse);

  const [ visible, setVisible ] = useState(false);
  const [ editVisible, setEditVisible ] = useState(false);

  const { children, title, type, src, text, display } = props;

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const handleEditCover = () => {
    setEditVisible(true);
  }

  const handleDeleteVideo = () => {
    let confirmLoading = false;
    Modal.confirm({
      title: lang(`course_1.content.delete.video`),
      icon: <Icon type="delete" theme="twoTone" twoToneColor="#eb2f96" />,
      content: lang(`course_1.content.confirm.video`),
      confirmLoading: confirmLoading,
      onOk: (e) => {
        confirmLoading = true;
        return course
          .resetFile(info.id, 'video')
          .catch(_err => {
            message.error(_err.msg);
            return null;
          })
          .then(ret => {
            confirmLoading = false;
            if (!!ret) {
              message.success("刪除成功");
              dispatch(getInfoAction(course_id));
            }
            return true;
          });
      },
      okText: lang(`general.button.confirm`),
      cancelText: lang(`general.button.cancel`),
    });
  };

  const view = {
    text: <div dangerouslySetInnerHTML={{ __html: text }} />,
    video: (
      <div className={styles.previewVideo}>
        <Video videosrc={src} />
        {staffPermit.update && (
          <>
            <div className={styles.previewVideoBtnWrap}>
              <Button icon="camera" onClick={handleEditCover}>
                {lang("course_1.content.edit.video")}
              </Button>
              {info.is_video === "Y" && (
                <Button icon="delete" type="danger" onClick={handleDeleteVideo}>
                  {lang("course_1.content.delete.video")}
                </Button>
              )}
            </div>
            <Modal
              title={lang("course_1.content.ModalTitle")}
              centered
              bodyStyle={{ backgroundColor: "#fff" }}
              visible={editVisible}
              onCancel={() => setEditVisible(false)}
              footer={null}
              maskClosable={false}
              destroyOnClose={true}
            >
              <DraggerImgUploading
                aspectRatio={33 / 8}
                URLid={info.id}
                type="video"
                onCancel={() => {
                  setEditVisible(false)
                  dispatch(getInfoAction(course_id))
                }}
              />
            </Modal> 
          </>
        )}
      </div>
    ) 
  }

  return (
    <>
      <div style={{ display: display || 'inline-block' }} onClick={() => setVisible(true)}>
        {children}
      </div>
      <Modal
        title={title}
        centered
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
      >
        {view[type]}
      </Modal>
    </>
  )
}


export default SchoolCoursePreview;