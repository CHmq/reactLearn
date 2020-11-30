import React from 'react';
import { Spin, Icon } from 'antd';

const Loading = () => {
  return (
    <div style={{display: 'flex', minHeight: "calc(100vh - 80px - 70px)", alignItems: "center",justifyContent: "center"}}>
      <Spin tip="Loading..." indicator={<Icon type="loading" style={{ fontSize: 24 }} spin />} />
    </div>
  ) 
}
export default Loading;