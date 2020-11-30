import React from 'react';
import { List, Avatar, Icon } from 'antd';

const CommentList = (props) => {

    const { data, listItemStyle } = props;

    return (
        <List
        style={{textAlign: 'left'}}
        itemLayout="vertical"
        size="large"
        dataSource={data}
        renderItem={item => (
            <List.Item
            key={item.user_id}
            style={listItemStyle}
            extra={!!item.comment ? <img
                width={120}
                alt="logo"
                src={item.icon}
            /> : ''}
            >
                <List.Item.Meta
                    avatar={<Avatar icon="user" src={item.user_img} style={{border: item.sex === 'F' ? '2px solid red' : '2px solid blue'}} />}
                    title={item.name}
                />
                {!!item.comment ? 
                <p style={{padding: 20, border: '1px solid #ddd'}}>{item.comment}</p> : 
                <div>
                    <img
                    width={80}
                    alt="logo"
                    src={item.icon}
                    />
                </div>}
                <span style={{fontSize: 12}}><Icon type="clock-circle" style={{ marginRight: 8 }} />{item.last_update_time}</span>
            </List.Item>
        )}/>
    )
}

export default CommentList;