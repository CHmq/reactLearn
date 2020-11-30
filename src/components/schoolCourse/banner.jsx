import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import intl from "react-intl-universal";
import {
  Row,
  Col,
  Button,
  Skeleton,
  Modal,
  message,
  Icon as AntdIcon,
  Avatar,
} from "antd";

import styles from "assets/css/schoolCourse.module.scss";
import btnIcon1 from "assets/image/schoolCourse/btn_icon_01.png";
import btnIcon2 from "assets/image/schoolCourse/btn_icon_02.png";
// import btnIcon3 from "assets/image/schoolCourse/btn_icon_03.png";

import course from "components/services/courseService";

import { getInfoAction } from "components/actions/schoolCourse_action";

import Icon from "./common/icon";
import SchoolCoursePreview from "./schoolCoursePreview";
import DraggerImgUploading from "components/common/UploadingFile";
import TextEdit from "components/common/TextEdit";

const Banner = (props) => {
  const dispatch = useDispatch();
  const { course_id } = useParams();
  const { loading } = props;
  const {
    translations,
    schoolCourse: { info, staffPermit },
  } = useSelector((state) => state);

  const { id, name, description, video, file, lang_info, school_id } = info;

  const [uploadType, setUploadType] = useState();
  const [editVisible, setEditVisible] = useState(false);

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  };

  const showUploadModal = (type) => {
    setUploadType(type);
    setEditVisible(true);
  };

  const handledeleteBg = (type) => {
    Modal.confirm({
      title: lang(`course_1.content.delete.${type}`),
      icon: <AntdIcon type="delete" theme="twoTone" twoToneColor="#eb2f96" />,
      content: lang(`course_1.content.confirm.${type}`),
      confirmLoading: true,
      onOk: (e) => {
        return course
          .resetFile(id, type)
          .catch((_err) => {
            message.error(_err.msg);
            return null;
          })
          .then((ret) => {
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

  return (
    <div
      className={styles.banner}
      style={{ backgroundColor: `#397dbc`, overflow: "hidden" }}
    >
      <Row type="flex" align="middle" className={styles.inner} gutter={35}>
        <Col xl={4} lg={5} xs={0} className={styles.file}>
          <Avatar size={200} src={file} alt="" />
          {staffPermit.update && (
            <div>
              <Button icon="camera" 
                onClick={() => showUploadModal('file')} 
              >
                {lang("course_1.content.changebtn")}
              </Button>
              <Button
                icon="delete"
                type="danger"
                onClick={() => handledeleteBg("file")}
              >
                {lang("course_1.content.delete.file")}
              </Button>
            </div>
          )}
        </Col>
        <Col xl={12} lg={12} xs={24} className={styles.blur}>
          <div className={styles.text}>
            <Skeleton active loading={loading}>
              <h1 className={styles.title}>{name}</h1>
              <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: description }}
              />
              <div className={styles.btnWrap}>
                {!!description && (
                  <SchoolCoursePreview
                    title={lang("schoolCourse.btn_description")}
                    type="text"
                    text={description}
                  >
                    <Button loading={loading} style={{ color: "#397dbc" }}>
                      <img src={btnIcon1} alt="" />
                      {lang("schoolCourse.btn_description")}
                    </Button>
                  </SchoolCoursePreview>
                )}
                {!!video && (
                  <SchoolCoursePreview
                    title={lang("course_1.content.videoTitle")}
                    type="video"
                    src={video}
                  >
                    <Button loading={loading} style={{ color: "#397dbc" }}>
                      <img src={btnIcon2} alt="" />
                      {lang("schoolCourse.btn_video")}
                    </Button>
                  </SchoolCoursePreview>
                )}
                {/* <Button><img src={btnIcon3} alt=""/>貼堂區</Button> */}
              </div>
            </Skeleton>
            {staffPermit.update && (
              <TextEdit
                name={name}
                description={description}
                langInfo={lang_info}
                URLid={id}
                schoolId={school_id}
                updateCallback={() => {
                  dispatch(getInfoAction(course_id));
                }}
              >
                <Button className={styles.set} shape="circle" icon="form" />
              </TextEdit>
            )}
          </div>
        </Col>
        {!!info.video_cover && (
          <Col xl={8} lg={7} xs={0} className={styles.blur2}>
            <img
              src={info.video_cover}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
              }}
            />
          </Col>
        )}
      </Row>
      {staffPermit.update && false && (
        <div className={styles.changeBgBtnWrap}>
          <Button icon="camera" onClick={() => showUploadModal("banner")}>
            {lang("course_1.content.edit.banner")}
          </Button>
          <Button
            icon="delete"
            type="danger"
            onClick={() => handledeleteBg("banner")}
          >
            {lang("course_1.content.delete.banner")}
          </Button>
        </div>
      )}
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
          aspectRatio={uploadType === "banner" ? 33 / 8 : 1 / 1}
          URLid={id}
          type={uploadType}
          onCancel={() => {
            setEditVisible(false);
            dispatch(getInfoAction(course_id));
          }}
          useBg={uploadType === "file"}
        />
      </Modal>
    </div>
  );
};

export default Banner;
