import React from 'react';
import { useSelector } from 'react-redux';
import { Row, Col, Icon } from 'antd';
import style from "assets/css/layout.module.scss";

export default function Download (props) {
  const { route: { currentLanguage, currentLocation } } = useSelector(state => state);

  const { show, onClose } = props;

  return (
    <Row
      className={`${style.eviDownload}`}
      style={{ display: show }}
      gutter={20}
    >
      <Col span={9}>
        <a
          href={`https://apps.apple.com/${currentLocation}/app/evigarten/id1464845844`}
          target="blank"
        >
          <img
            src={require("assets/image/icon/btn-download-iphone.png")}
            alt="ios-download"
          />
        </a>
      </Col>
      <Col span={9}>
        <a
          href={`https://play.google.com/store/apps/details?id=hk.com.evi.evifamily.kids`}
          target="blank"
        >
          <img
            src={require("assets/image/icon/btn-download-android.png")}
            alt="android-download"
          />
        </a>
      </Col>
      <Col span={6}>
        <a
          href={`https://app-info.evigarten.com/release/${currentLanguage.value}.html`}
          target="blank"
        >
          <img
            src={require("assets/image/icon/apk_download.png")}
            alt="apk-download"
          />
        </a>
      </Col>
      <div className={style.close} onClick={onClose}>
        <Icon type="close"></Icon>
      </div>
    </Row>
  )
}