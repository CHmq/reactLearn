import React, { Component } from 'react';
import { Button, Modal, Icon, Form, Input, message } from 'antd';

import { connect } from "react-redux";
import intl from "react-intl-universal";

import mainService from "components/services/mainService";
import user_API from "components/services/userService";

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}


class CheckPsw extends Component {
    state = {
        visible: false
    }

    componentDidMount() {
        this.props.form.validateFields();
    }

    onOK = async () => {
        const { lang } = this;
        const { editorId, updateCallback, form: {getFieldValue}, translations } = this.props;
        const password = getFieldValue('password');
        if (password) {
            await user_API.checkPassword(password).catch(error => {
                console.log(error);
                message.error(lang(`general.error.wrong_pw`));
                return null;
            }).then(ret => {
                if(editorId && ret === 1) {
                    return mainService.mainDelete(editorId).catch(({result}) => {
                        if (result === 1401) {
                            message.warning(lang(`general.msg.prohibit_deletion`));
                            return;
                        }
                        message.error(lang(`general.msg.failure`));
                        return null;
                    }).then(res => {
                        if(!!res) {
                            if(updateCallback) updateCallback();
                            this.setState({visible: false});
                            message.success(translations.initDone && intl.get(`general.msg.success`));
                        }
                        return true;
                    });
                }
            });
        }
    }

    lang = (value) => {
        return this.props.translations.initDone && intl.get(value);
    }

    showModal = () => {
        this.setState({ visible: true })
    }

    render() {
        const { lang } = this;
        const { visible } = this.state;
        const { translations, form: { getFieldDecorator, isFieldTouched, getFieldError, getFieldsError } } = this.props;
        const passwordError = isFieldTouched('password') && getFieldError('password');
        return (
            <>
                <Button type="danger" onClick={this.showModal} size="small">
                    {lang(`course_1.content.deletebtn`)}
                </Button>
                <Modal 
                visible={visible}
                destroyOnClose
                zIndex={500}
                closable={false}
                onOk={this.onOK}
                okButtonProps={{htmlType: 'submit', disabled: hasErrors(getFieldsError())}}
                okText={lang(`general.button.confirm`)}
                cancelText={lang(`general.button.cancel`)}
                onCancel={()=>this.setState({visible: false})}>
                    <div style={{fontSize: 20, marginBottom: 10}}>
                        <Icon type='delete' theme="twoTone" /> 刪除課件
                    </div>
                    <Form onSubmit={this.onOK}>
                        <Form.Item validateStatus={passwordError ? 'error' : ''}>
                        {getFieldDecorator("password", {rules: [{ required: true, message: '密码不能为空' }]})(<Input.Password prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="請輸入密碼" />)}
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        )
    }  
}

function mapStateToProps( { translations }) {
    return {
        translations
    };
}

export default connect(mapStateToProps)(Form.create()(CheckPsw));