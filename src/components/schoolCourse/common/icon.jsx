import React, { useMemo } from 'react';
import { Avatar } from 'antd';

// import { RESOURCE_ICON } from "config/course.json";

const Icon = ({ type, size }) => {

  // const newValue = value === 'course' || RESOURCE_ICON.includes(value) ? value : 'file';

  const newValue = useMemo(() => {
    const value = (type || '').toLowerCase();
    return ['course', 'project'].includes(value) ? value : 'video'; 
  }, [type])

  return (
    <Avatar 
      size={size} 
      src={require(`assets/image/schoolCourse/icon/${newValue}.png`)} 
    />
  )
}

Icon.defaultProps = {
  type: 'course',
  size: '100%'
}

export default Icon;