import React from "react";
import { useSelector } from "react-redux";
import intl from "react-intl-universal";

import { Tabs, Row, Col } from "antd";

const { TabPane } = Tabs;

const imageList = [
  [11, 12, 13, 14, 15, 16, 17, 18, 19],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [21, 22, 23, 24, 25, 26, 27, 28]
];

const DefaultBgTabs = (props) => {
  const { bgIdx, setBgIdx } = props;

  const { initDone } = useSelector((state) => state.translations);

  const translation = function (text) {
    return initDone && intl.get(text);
  };

  const category = [
    translation("course_1.UploadingFile.tab_theme"), 
    translation("course_1.UploadingFile.tab_frame"),
    translation("course_1.UploadingFile.tab_character"),
  ];

  return (
    <Tabs defaultActiveKey="0" onChange={(key) => console.log(key)} style={{width: '100%', minHeight: 100}}>
      {category.map((item, index) => (
        <TabPane tab={item} key={index} style={{ maxHeight: 500 }}>
          <Row type="flex" justify="start" gutter={[10, 10]} style={{padding: 5}}>
            {imageList[index].map((item, index) => (
              <Col
                span={8}
                style={{ cursor: "point" }}
                key={index}
                onClick={() => {
                  setBgIdx(item);
                }}
              >
                <img
                  src={`https://oss-resource.evigarten.com/course/default/bg/${item.toString()}.png`}
                  alt=""
                  width="100%"
                  height="100%"
                  style={{
                    outline: bgIdx === item ? "2.5px #39c5bb solid" : "",
                  }}
                />
              </Col>
            ))}
          </Row>
        </TabPane>
      ))}
    </Tabs>
  );
};

export default DefaultBgTabs;
