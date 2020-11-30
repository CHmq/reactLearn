import React, { useState, useRef, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import intl from "react-intl-universal";
import { Textfit } from "react-textfit";
import { Menu, Dropdown, Icon as AntdIcon, Button, Modal, message } from "antd";

import styles from "assets/css/schoolCourse.module.scss";

import Icon from "./common/icon";
import hotIcon from "assets/image/schoolCourse/hot_icon.png";

import courseService from "components/services/courseService";
import user_API from "components/services/userService";
import staff from "components/services/staffService";
import { setDefaultPreviewImg } from "components/services/mainService";

import { SUPPORT_SCHOOL } from "config/course.json";

import {
  getListAction,
  setLikeAction,
  deleteCourseAction,
} from "components/actions/schoolCourse_action";

import CourseEditor from "components/course/CourseEditor";
import DraggerImgUploading from "components/common/UploadingFile";
import LandingPopup from "components/LandingPopup";

import Explore360 from "components/Explore360";
import FilePreview from "components/resource/FilePreview";
import Adapter from "components/resource/Adapter";
import SchoolResource from "components/course/schoolResourceEditor";
import SchoolCourseDelete from "./schoolCourseDelete";

const SchoolCourseItem = memo(({ data }) => {
  const editRef = useRef();
  const schoolResourceRef = useRef();
  const dispatch = useDispatch();

  const { course_id } = useParams();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [coverModalVisible, setCoverModalVisible] = useState(false);

  const {
    translations,
    schoolCourse: { info, class: classData, staffPermit },
    route: { currentLanguage },
  } = useSelector((state) => state);

  const isCourse = data.type === "COURSE";

  const date =
    data.publish_time && data.end_time
      ? data.publish_time.split(" ")[0] + " - " + data.end_time.split(" ")[0]
      : "";

  const merchantID =
    user_API.getType() === "STAFF" ? user_API.staff().merchant_uid : "";

  const lang = (value) => {
    return translations.initDone && intl.get(value);
  };

  const handleEdit = (e) => {
    e.domEvent.preventDefault();
    e.domEvent.stopPropagation();
    if (!!editLoading) {
      return;
    }
    let $$call = courseService
      .getFullInfo(data.ref_id)
      .then((ret) => {
        setEditLoading(false);
        editRef.current.showModal(ret);
      })
      .catch((_msg) => {
        console.log(_msg);
      });
    setEditLoading(true);
    return $$call;
  };

  const handleEditCover = (e) => {
    setCoverModalVisible(true);
  };

  const handleDelete = SchoolCourseDelete({
    title: lang("course_1.content.delete.del_btn.title"),
    content:
      lang("course_1.content.delete.del_btn.del_contant") +
      `「${data.name}」？`,
    isFun: true,
    onOk() {
      return dispatch(
        deleteCourseAction({
          id: data.id,
          callback() {
            haneldRefreshList();
          },
        })
      );
    },
  });

  const handleSetLike = () => {
    const type = data.is_favourite === "Y" ? "starDelete" : "starAdd";
    dispatch(
      setLikeAction({
        id: data.ref_id,
        type,
        callback() {
          haneldRefreshList();
        },
      })
    );
  };

  const handleSchoolResourceEdit = () => {
    schoolResourceRef.current.onOpend(
      data,
      lang("course_1.content.PopupCoursware.edit"),
      "update",
      data.ref_id
    );
  };

  const handleVisibleChange = (flag) => {
    setDropdownVisible(flag);
  };

  const haneldRefreshList = () => {
    dispatch(getListAction({ id: course_id, is_cache: "N" }));
  };

  const all =
    !isCourse &&
    !["jttw360", "project"].includes(data.res_type) &&
    !(staff.checkMerchant(data.school_id) && staffPermit.update);

  // 修改学校封面函数
  const schoolResourceUploadBg = async (bgIndex) => {
    try {
      await setDefaultPreviewImg(data.ref_id, bgIndex);
      haneldRefreshList();
      message.success(
        translations.initDone && intl.get(`general.msg.update_success`),
        () => setCoverModalVisible(false)
      );
    } catch (error) {
      message.error(
        translations.initDone && intl.get(`general.msg.update_error`)
      );
    }
  };

  const menu = (
    <Menu onClick={() => setDropdownVisible(false)}>
      {/* 編輯課程 */}
      {isCourse && staffPermit.get_list && (
        <Menu.Item onClick={handleEdit}>
          <AntdIcon type={editLoading ? "loading" : "setting"} />{" "}
          {lang("schoolCourse.menu_edit")}
        </Menu.Item>
      )}
      {/* 只有是類型 school 可以修改封面 */}
      {(data.adapter_type === "SCHOOL" || isCourse) && staffPermit.get_list && (
        <Menu.Item onClick={handleEditCover}>
          <AntdIcon type="camera" /> {lang("schoolCourse.menu_change_cover")}
        </Menu.Item>
      )}
      {isCourse &&
        staffPermit.get_list &&
        SUPPORT_SCHOOL.indexOf(merchantID) > -1 &&
        (data.create_time >= "2020-02-01 00:00:00" ||
          data.publish_time >= "2020-02-01 00:00:00") && (
          <Menu.Item>
            <LandingPopup
              title={"學生管理"}
              type={"studentedit"}
              width={1600}
              className={"manageModal"}
              loginpic="schoolCourse"
              courseId={data.ref_id}
              item={data}
              zIndex={777}
            />
          </Menu.Item>
        )}
      {["jttw360", "project"].includes(data.res_type) && (
        <Menu.Item>
          <Explore360
            item={data}
            classList={classData.classList}
          >
            <AntdIcon type="pie-chart" style={{ marginRight: 8 }} />{" "}
            {lang("schoolCourse.menu_repot")}
          </Explore360>
        </Menu.Item>
      )}
      {data.type === "RESOURCE" &&
        staff.checkMerchant(data.school_id) &&
        staffPermit.update && (
          <Menu.Item onClick={handleSchoolResourceEdit}>
            <AntdIcon type="setting" /> {lang("schoolCourse.menu_edit")}
          </Menu.Item>
        )}
      {staff.checkMerchant(data.school_id) && staffPermit.delete && (
        <Menu.Item onClick={handleDelete}>
          <AntdIcon type="delete" /> {lang("schoolCourse.menu_delete")}
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <>
      <div className={styles.schoolCourseItem}>
        <Adapter course={info} item={data} ref_id={data.ref_id} id={data.ref_id} nWindow={true}>
          <div className={styles.imgWrap}>
            <img
              className={styles.file}
              src={data.bg_file || data.file}
              alt=""
            />
            {data.bg_file && (
              <div title={data.name} className={styles.title}>
                <Textfit mode="single">{data.name}</Textfit>
              </div>
            )}
            {data.publish_status === "PROGRESS" && data.is_hot === "Y" && (
              <div className={styles.hot}>
                <img src={hotIcon} alt="hot" />
              </div>
            )}
            {data.publish_status === "FINISH" && user_API.getType() === "STAFF" && (
              <React.Fragment>
                {user_API.getType() === "STAFF" && (
                  <div className={styles.dim} />
                )}
                <div className={styles.completed}>
                  <AntdIcon type="exclamation" />
                </div>
              </React.Fragment>
            )}
          </div>
          <div title={data.name} className={styles.title}>
            {data.name}
          </div>
          <div className={styles.date}>{date}</div>
        </Adapter>
        <div className={styles.type}>
          <Icon type={data.res_type || data.type} size={70} />
        </div>
        {user_API.getType() === "STAFF" && !all && (
          <Dropdown
            visible={dropdownVisible}
            overlay={menu}
            trigger={["click"]}
            onVisibleChange={handleVisibleChange}
          >
            <Button className={styles.more} shape="circle" icon="more" />
          </Dropdown>
        )}
        {data.type === "RESOURCE" && (
          <div
            className={`${styles.actions} ${
              user_API.getType() === "STAFF" && !all ? styles.move : ""
            }`}
          >
            {(!!data.user_log.user_record_file ||
              !!data.user_log.jttw_user_record_file) &&
              !data.user_log.icon && (
                <FilePreview
                  file={
                    data.user_log.user_record_file ||
                    data.user_log.jttw_user_record_file
                  }
                >
                  <Button icon="check" style={{ color: "#8dc642" }} />
                </FilePreview>
              )}
            {data.res_type !== "project" && (
              <Button
                onClick={handleSetLike}
                style={{ padding: 0, width: 32, fontSize: 16 }}
              >
                <AntdIcon
                  type="heart"
                  style={{
                    color: data.is_favourite === "Y" ? "pink" : "#d6d6d6",
                  }}
                  theme="filled"
                />
              </Button>
            )}
          </div>
        )}
      </div>
      <CourseEditor
        forwardedRef={editRef}
        URLid={info.id}
        refresh={haneldRefreshList}
      />
      <Modal
        title={lang("course_1.content.ModalTitle")}
        centered
        bodyStyle={{ backgroundColor: "#fff" }}
        visible={coverModalVisible}
        onCancel={() => setCoverModalVisible(false)}
        footer={null}
        maskClosable={false}
        destroyOnClose={true}
      >
        <DraggerImgUploading
          aspectRatio={4 / 3}
          URLid={data.ref_id || info.id}
          bgId={data.bg_id}
          type={data.type === 'COURSE' ? 'file' : 'schoolResouce_preview'}
          onCancel={() => {
            setCoverModalVisible(false);
            haneldRefreshList();
          }}
          apiFun={
            data.adapter_type === "SCHOOL"
              ? (bgIndex) => schoolResourceUploadBg(bgIndex)
              : null
          }
        />
      </Modal>
      <SchoolResource
        wrappedComponentRef={schoolResourceRef}
        updateCallback={haneldRefreshList}
      />
    </>
  );
});

export default SchoolCourseItem;
