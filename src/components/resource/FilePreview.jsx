import React, { Component } from "react";
import { Modal, Button, Icon, Row, Col } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { Document, Page, pdfjs } from "react-pdf";
import UserRecordCMT from "components/course/UserRecordCMT";
import CommentList from "components/course/CommentList";
import course from "components/services/courseService";
import Video from "components/common/Video";
import { fileTypeOf } from "components/utils/type";

import "assets/css/studentedit.module.scss";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class FilePreview extends Component {
  state = {
    visible: false,
    commentData: [],
  };

  showModal = async () => {
    this.setState({ visible: true });
    if (this.props.id) {
      await course
        .getComment(this.props.id)
        .then((ret) => {
          if(this.state.visible) {
            this.setState({ commentData: ret.rows });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  getType = (file) => {
    let filename = file;
    let index1 = filename.lastIndexOf(".");
    let index2 = filename.length;
    let type = filename.substring(index1, index2);
    return type;
  };

  setFile = (data) => {
    let str = "";
    if (!!data) {
      const file = data.toLowerCase();
      switch (true) {
        case fileTypeOf(file, [".mp4", ".mov", ".m3u8"]):
          str = <Video videosrc={file} light={false} />;
          break;
        case file.endsWith(".jpeg") ||
          file.endsWith(".jpg") ||
          file.endsWith(".png") ||
          file.endsWith(".gif"):
          str = <img src={file + "!auto"} alt="" />;
          break;
        case file.endsWith(".mp3"):
          str = <audio src={file} autoPlay controls></audio>;
          break;
        case file.endsWith(".pdf"):
          str = (
            <Document file={file} renderMode="canvas">
              <Page className="documentPage" pageNumber={1} />
            </Document>
          );
          break;
        default:
          str = (
            <div>
              <Icon type="file" className="icon" />
              <p>{this.getType(file)}</p>
            </div>
          );
          break;
      }
    }
    return str;
  };

  callback = () => {
    this.setState({ visible: false });
    this.props.callback();
  };

  onCancel = () => {
    this.setState({ visible: false });
  };

  render() {
    const { commentData, refresh } = this.state;
    const {
      file,
      downloadFile,
      translations,
      display,
      id,
      showComment,
      commentType,
      zIndex
    } = this.props;

    return (
      <>
        <div
          key={refresh}
          onClick={this.showModal}
          style={{ display, cursor: "pointer" }}
        >
          {this.props.children}
        </div>
        <Modal
          width={showComment ? 900 : 600}
          visible={this.state.visible}
          onCancel={this.onCancel}
          footer={null}
          maskClosable={false}
          style={{ textAlign: "center" }}
          destroyOnClose
          zIndex={zIndex}
        >
          <Row gutter={20}>
            <Col sm={showComment ? 14 : 24} xs={24}>
              <div className="preview">{this.setFile(file)}</div>
              <Button href={downloadFile || file} type="primary" target="blank" icon="download">
                {translations.initDone && intl.get(`general.button.download`)}
              </Button>
            </Col>
            {showComment && (
              <Col sm={10} xs={24} style={{ marginTop: 20 }}>
                {commentType === "add" ? (
                  <UserRecordCMT
                    id={id}
                    data={this.state.commentData}
                    callback={this.callback}
                  />
                ) : (
                  <CommentList data={commentData} />
                )}
              </Col>
            )}
          </Row>
        </Modal>
      </>
    );
  }
}

FilePreview.defaultProps = {
  zIndex: 999
}

function mapStateToProps({ translations }) {
  return { translations };
}

export default connect(mapStateToProps)(FilePreview);
