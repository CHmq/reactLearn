import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Menu } from 'antd';

import Icon from './common/icon';

const { SubMenu } = Menu;

const SelectType = () => {
  const { list } = useSelector(state => state.schoolCourse);

  const config = {
    COURSE: '課程',
    video: '影片',
    teach_guide: '探索小活動'
  }

  const typeList = useMemo(() => {
    return list.rows.reduce((acc, item) => {
      const type = item.res_type || item.type
      if(!acc.includes(type)) {
        acc.push(type)
      }
      return acc;
    }, [])
  }, [list.rows])

  const handleSelectType = (newValue) => {
    // if(onSelectType) onSelectType(newValue);
    console.log(newValue);
  }

  return (
    <Menu mode="horizontal" defaultSelectedKeys={['all']} onSelect={({ key }) => handleSelectType(key)} >
      <Menu.Item key="all">
        所有類別
      </Menu.Item>
      {typeList.map((item, index) => {
        return index < 3 ? (
          <Menu.Item key={item}>
            <Icon type={item} size={50} /> {config[item]}
          </Menu.Item>
        ) : ''
      })}
      {typeList.length > 3 && (
        <SubMenu title={"..."}>
          {typeList.map((item, index) => {
            return index >= 3 ? (
              <Menu.Item key={item}>
                <Icon type={item} size={50} /> {config[item]}
              </Menu.Item>
            ) : ''
          })}
        </SubMenu>
      )}
    </Menu>
  )
}

export default SelectType;