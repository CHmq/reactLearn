import React, { Fragment, useState, useEffect } from 'react';
import { connect } from "react-redux";

import { Modal, Row, Col, Button, Icon } from 'antd';

import intl from "react-intl-universal";

let timer = null;

const ImgPreview = (props) => {
  const { data, loadStatus, onClose, medal } = props;
  const { translations } = props;

  const [ visible, setVisible ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    if(loadStatus) {
      clearTimeout(timer);
    }
  }, [loadStatus])

  const showModal = () => {
    setVisible(true);
    if(medal) {
      setLoading(true);
      _setTimeout(5000);
    }
  }

  const onCancel = () => {
    setVisible(false);
    clearTimeout(timer);
    onClose();
  }

  const _setTimeout = (delay) => {
    clearTimeout(timer);
    timer = setTimeout(function() {
      setLoading(false);
      props.onRefresh();
    }, delay);
  }

  const onRefresh = () => {
    clearTimeout(timer);
    setLoading(true);
    _setTimeout(5000);
  }

  const _lang = (value) => {
    return translations.initDone && intl.get(value);
  }

  const large = loadStatus && data.length > 1;

  return (
    <Fragment>
      <div onClick={showModal} style={{ cursor: 'pointer' }}>
        {props.children}
      </div>
      <Modal
        visible={visible}
        onCancel={onCancel}
        footer={null}
        destroyOnClose={true}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto'}}
      >
        <Row type="flex" justify="start" align="center" gutter={20}>
          {loadStatus && (
            data.map(item => (
              <Col xs={large ? 8 : 24} style={{textAlign: 'center', marginBottom: 20}}>
                <img src={item.file_preview} alt="" style={{width: '100%', marginBottom: 20}} />
                <Button type="primary" icon="download" href={item.file_download} target="blank">
                  {_lang(`general.button.download`)}
                </Button>
              </Col>
            ))
          )}
          {!loadStatus && (
            <Col xs={24} style={{minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              {medal ? (
                loading ? (
                  <div style={{textAlign: 'center'}}>
                    <Icon type="redo" spin style={{fontSize: 30}}/>
                    <p>{_lang(`achievements.content.loading_msg`)}</p>
                  </div>
                ) : (
                  <Button type="primary" onClick={onRefresh} icon="redo">
                    {_lang(`general.button.refresh`)}
                  </Button>
                )
              ) : _lang(`achievements.content.medal_msg`)}
            </Col>
          )}
        </Row>
      </Modal>
    </Fragment>
  )
}

function mapStateToProps({ translations }) {
  return { translations };
}

export default connect(mapStateToProps)(ImgPreview);