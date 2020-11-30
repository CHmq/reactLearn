import React, { useState, useEffect } from "react";
import { Button, Row, Col, Checkbox, Divider, message } from "antd";
import { useSelector } from "react-redux";
import intl from "react-intl-universal";

import DefaultBgTabs from "./DefaultBgTabs";

import course from "components/services/courseService";

// const imageList = ["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"];

const setDefaultBg = (props) => {
  const { bgId, uploading, onCancel } = props;

  const { initDone } = useSelector((state) => state.translations);

  const [checkBg, setCheckBg] = useState(false);
  const [bgIdx, setBgIdx] = useState(null);

  // 當存在默認背景圖時,選取並啟用.
  useEffect(() => {
    if (bgId) {
      setCheckBg(true);
      setBgIdx(parseInt(bgId, 10));
    }
  }, []);

  // 點擊圖片時,自動選中checkbox
  useEffect(() => {
    if (bgIdx) {
      setCheckBg(true);
    }
  }, [bgIdx]);

  const translation = function (text) {
    return initDone && intl.get(text);
  };

  const uploadingBg = async () => {
    const { URLid, apiFun } = props;

    const index = bgIdx ? bgIdx : "";

    if (apiFun) {
      apiFun(index);
      return;
    }

    try {
      await course.uploadBgFile(URLid, index);
      message.success(
        translation("general.msg.update_success"),
        () => typeof onCancel === "function" && onCancel()
      );
    } catch (error) {
      console.log(error);
      message.error(translation("general.msg.update_error"));
    }
  };

  return (
    <>
      <Row type="flex" justify="space-around">
        <Divider />
      </Row>
      <Row type="flex" justify="space-around">
        <Checkbox
          checked={checkBg}
          onChange={(e) => {
            const { checked } = e.target;
            setCheckBg(checked);
            if (!checked) {
              setBgIdx(null);
            }
          }}
        >
          {translation("course_1.UploadingFile.uploadDefaultImg")}
        </Checkbox>
      </Row>
      <Row
        type="flex"
        justify="space-around"
        gutter={16}
        style={{ margin: "1rem 0" }}
      >
        <DefaultBgTabs bgIdx={bgIdx} setBgIdx={setBgIdx} />
      </Row>
      <Row type="flex" justify="space-around">
        <Button type="primary" onClick={uploadingBg} loading={uploading}>
          {translation("course_1.UploadingFile.btn")}
        </Button>
        <Button type="primary" onClick={onCancel}>
          {translation("course_1.UploadingFile.cancel")}
        </Button>
      </Row>
    </>
  );
};

export default setDefaultBg;
