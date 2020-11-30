import React, { Component } from 'react';
import { Modal, Form, Radio, Button, Input, message, Select, Checkbox } from 'antd';
import { connect } from "react-redux";
import { SUPPORT_LOCALES } from "config/locale.json";
import intl from "react-intl-universal";

import course from "components/services/courseService";
import user_API from "components/services/userService";

import BraftEditor from 'braft-editor'

const { Option } = Select;
const controls = ['bold', 'list-ul', 'separator', 'link', {
    key: 'media',
    accepts: 'image'
}]

const locale = {
    lang: [
        {
            name: "繁體中文",
            value: "zh",
            url: "zh-hk"
        },
        {
            name: "English",
            value: "english",
            url: "en"
        },
        {
            name: "简体中文",
            value: "cn",
            url: "zh-cn"
        }
    ]
};

const defaultRegion = {
    "CN": 46,
    "HK": 101,
    "MO": 132,
    "MY": 136,
}

class NewsEdit extends Component {
    state = {
        visible: false,
        loading: false,
        lang: this.props.route.currentLanguage.value,
        data: null,
        langInfo: null
    }

    lang = value => {
        return this.props.translations.initDone && intl.get(value);
    }

    init = () => {
        this.setState({
            loading: false,
            lang: this.props.route.currentLanguage.value,
            data: null,
            langInfo: null
        })
    }

    vaIidate = () => {
        const { getFieldsError, getFieldsValue } = this.props.form;
        const arr = this.state.lang === 'zh' ? ["is_show", "page", "title", "region"] : ["title"];
        const value = Object.values(getFieldsValue(arr)).every(
            item => item !== undefined && item !== ""
        );
        const error = Object.values(getFieldsError(arr)).every(
            item => item === "" || item === undefined
        );
        return value === true && error === true ? false : true;
    };

    setVisible = bool => {
        const { lang } = this.state;
        this.setState({visible: bool}, async () => {
            if(bool && !!this.props.id) {
                await course.getNews(this.props.id).then(ret => {
                    const region = defaultRegion[ret.region];
                    this.props.form.setFieldsValue({
                        "region": region, 
                        "content": BraftEditor.createEditorState(!!ret.content ? ret.content : void 0)
                    });
                    this.setState({
                        data: ret,
                        langInfo: ret.lang.find(item => item.lang === lang)
                    })
                }
                ).catch(error => {
                    console.log(error);
                })
                return;
            }
            this.props.form.setFieldsValue({"region": 101});
        })
        !bool && this.init();
    }

    onChange = e => {
        const { resetFields, setFieldsValue } = this.props.form;

        resetFields();
        this.setState({
            lang: e.target.value,
            langInfo: this.state.data.lang.find(item => item.lang === e.target.value)
        }, () => {
            const is_data = !!this.state.langInfo && Object.keys(this.state.langInfo).length !== 0;
            setFieldsValue(
                {"content": BraftEditor.createEditorState(is_data ? this.state.langInfo.content : void 0)}
            );
        });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        this.setState({loading: true});
        const { callBack } = this.props;
        const value = this.props.form.getFieldsValue();

        value.page = !!value.page ? value.page.join(',') : void 0;
        value.id = !!this.props.id ? this.props.id : void 0;
        value.lang_id = !!this.props.id && this.state.lang !== 'zh' ? this.state.lang : void 0; 
        value.no_data = !this.state.langInfo;
        value.content = value.content.toHTML();

        await course.editNews(value).then(() => {
            message.success(this.lang('general.msg.success'));
            if(callBack) callBack();
            this.setState({loading: false, visible: false});
        }).catch(_msg => {
            message.error(this.lang('general.msg.failure'));
            this.setState({loading: false});
        })
    }

    render() {
        const { visible, loading, lang, data, langInfo } = this.state;
        const { getFieldDecorator } = this.props.form;
        const { route: { currentLocation }} = this.props;
        const is_zh = lang === 'zh';
        const is_data = !!langInfo && Object.keys(langInfo).length !== 0;
        return (
            <>
                <div onClick={() => this.setVisible(true)}>{this.props.children}</div>
                <Modal 
                visible={visible} 
                onCancel={() => this.setVisible(false)} 
                footer={null}
                destroyOnClose
                title={!!this.props.id ? (
                    <Radio.Group value={this.state.lang} onChange={this.onChange} disabled={!data}>
                        {(user_API.staff().merchant_uid === '1' ? locale.lang : SUPPORT_LOCALES[currentLocation].lang).map((item, index) => (
                            <Radio.Button value={item.value} key={item.value + index}>{item.name}</Radio.Button>
                        ))}
                    </Radio.Group>
                ) : ""
                }>
                    <Form onSubmit={this.handleSubmit}>
                        {is_zh && (
                            <Form.Item label={this.lang('general.form.page')}>
                            {getFieldDecorator('page', {
                                rules: [{
                                required: true,
                                message: '此項為必填項',
                                }],
                                initialValue: !!data && is_zh ? data.page: void 0
                            })(
                                <Checkbox.Group>
                                    <Checkbox value="landing">Landing</Checkbox>
                                    <Checkbox value="home">Home</Checkbox>
                                </Checkbox.Group>
                            )}
                            </Form.Item>
                        )}
                        {is_zh && (
                            <Form.Item label={this.lang('general.form.region')}>
                            {getFieldDecorator('region', {
                                rules: [{
                                required: true,
                                message: '此項為必填項',
                                }],
                                initialValue: !!data && is_zh ? data.region: void 0
                            })(
                                <Select style={{ width: 180 }}>
                                    <Option value={46}>CN</Option>
                                    <Option value={101}>HK</Option>
                                    <Option value={132}>MO</Option>
                                    <Option value={136}>MY</Option>
                                </Select>
                            )}
                            </Form.Item>
                        )}
                        <Form.Item label={this.lang('course_1.content.edit.tiptitle')}>
                            {getFieldDecorator('title', {
                                rules: [{
                                required: true,
                                message: '此項為必填項',
                                }],
                                initialValue: is_data ? langInfo.title: void 0
                            })(
                                <Input size="large" placeholder="..." />
                            )}
                        </Form.Item>
                        <Form.Item label={this.lang('course_1.content.edit.tiptext')}>
                            {getFieldDecorator('content')(
                                <BraftEditor
                                controls={controls}
                                placeholder="..."
                                style={{maxHeight: 300, overflowX: 'hidden', border: '1px solid #d9d9d9', borderRadius: 4}}
                                />
                            )}
                        </Form.Item>
                        <Form.Item label={'iframe_url'}>
                            {getFieldDecorator('iframe_url', {
                                initialValue: is_data ? langInfo.iframe_url : void 0
                            })(
                                <Input size="large" placeholder="..." />
                            )}
                        </Form.Item>
                        {is_zh && (
                            <Form.Item label={this.lang('general.form.is_show')}>
                            {getFieldDecorator('is_show', {
                                rules: [{
                                required: true,
                                message: '此項為必填項',
                                }],
                                initialValue: !!data && is_zh ? data.is_show : void 0
                            })(
                                <Radio.Group>
                                    <Radio value='Y'>Y</Radio>
                                    <Radio value='N'>N</Radio>
                                </Radio.Group>
                            )}
                            </Form.Item>
                        )}
                        {is_zh && (
                            <Form.Item label='res_id'>
                            {getFieldDecorator('res_id')(
                                <Input size="large" placeholder="..." />
                            )}
                            </Form.Item>
                        )}
                        {is_zh && (
                            <Form.Item label='course_id'>
                            {getFieldDecorator('course_id')(
                                <Input size="large" placeholder="..." />
                            )}
                            </Form.Item>
                        )}
                        <Form.Item style={{textAlign: 'center'}}>
                            <Button type='primary' htmlType="submit" loading={loading} disabled={this.vaIidate()}>
                                {this.lang('course_1.content.edit.tipbtn')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        )
    }
}

function mapStateToProps({ route, translations }) {
    return {
        route,
        translations
    };
}

export default connect(
    mapStateToProps
)(Form.create()(NewsEdit));