import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Input, Button, message, Icon } from 'antd';
import { connect } from "react-redux";
import intl from "react-intl-universal";

import course from "components/services/courseService";

const UserRecordCMT = (props) => {
    const { getFieldDecorator, validateFields, setFieldsValue, getFieldsError, getFieldsValue } = props.form;
    const { id, data, callback } = props;

    const icons = ["cmt_icon1", "cmt_icon2", "cmt_icon3", "cmt_icon4"];
    const styles = {
        icon: {
            width: "100%",
            cursor: "pointer",
            borderRadius: '50%'
        },
        mb20: {
            marginBottom: 20
        },
        submitBtn: {
            width: 150,
            height: 50,
            backgroundColor: '#00c6ff',
            border: 0,
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            borderRadius: 8
            
        }
    }

    const lang = (value) => {
        return props.translations.initDone && intl.get(value);
    }

    const [ active, setActive ] = useState('');

    useEffect(()=>{
        if (!!data.length) {
            console.log(data);
            setActive(data[0].star);
            setFieldsValue({comment: data[0].comment});
        }
    }, [data])

    const onSelect = (key) => {
        if (active == key ) {
            setActive('');
            return;
        }
        setActive(key);
    }

    // const init = () => {
    //     setActive('');
    //     setFieldsValue({comment: ''});
    // }

    const handleSubmit = async (e) => {
        e.preventDefault();
        validateFields((err, { comment }) => {
            if (id && active) {
                course.addComment(id, active, comment).then(ret => {
                    console.log(ret);
                    message.success(lang('general.msg.success'));
                    typeof callback === "function" && callback();
                }).catch(err => {
                    console.log(err);
                    message.error(lang('general.msg.failure'));
                })
            }
        })
    }

    const vaIidate = () => {
        const value = Object.values(getFieldsValue(["comment"])).every(
            item => item !== undefined && item !== ""
        );
        const error = Object.values(getFieldsError(["comment"])).every(
            item => item === "" || item === undefined
        );
        return value === true && error === true ? false : true;
    };
    return (
        <Row>
            <Col style={styles.mb20}>
                <Row gutter={6}>
                    {icons.map((item, index) => (
                        <Col span={6} key={item}>
                            <img 
                            style={{
                                border: active == index + 1 ? '3px solid #00c6ff' : 0, 
                                filter: `grayscale(${active == index + 1 || !active ? '0' : '100'}%)`,
                                ...styles.icon
                            }} 
                            src={require(`assets/image/${item}.png`)}
                            onClick={() => onSelect(index + 1)}
                            alt="icon"
                            />
                        </Col>
                    ))}
                </Row>
            </Col>

            <Col>
                <Form onSubmit={handleSubmit} >
                    <Form.Item style={{marginBottom: 0}}>
                    {getFieldDecorator('comment')(
                        <Input.TextArea placeholder={lang('general.msg.comment_msg')} autoSize={{ minRows: 4, maxRows: 10 }} />
                    )}
                    </Form.Item>
                    {!!data.length && (
                        <Form.Item style={{textAlign: 'left'}}>
                            <span style={{fontSize: 12}}>
                                <Icon type="clock-circle" style={{ marginRight: 8 }} />{data[0].last_update_time}
                            </span>
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Button htmlType="submit" style={styles.submitBtn} onClick={handleSubmit} disabled={!active}>
                            {lang('general.button.score')}
                        </Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    )
}


function mapStateToProps({ translations }) {
    return { translations };
}
  
export default connect(mapStateToProps)(Form.create()(UserRecordCMT));