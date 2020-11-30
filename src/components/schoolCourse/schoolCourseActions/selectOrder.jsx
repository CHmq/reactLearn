import React from 'react';

import { Select } from 'antd';

const { Option } = Select;

const SelectOrder = () => {
  const handleChange = (e) => {
    console.log(e);
  }
  return (
    <Select defalutValue="all" style={{ width: 120 }} onChange={handleChange}>
      <Option value="all">全部</Option>
      <Option value="ASC">日期順序</Option>
      <Option value="DESC">日期降序</Option>
    </Select>
  )
}

export default SelectOrder;