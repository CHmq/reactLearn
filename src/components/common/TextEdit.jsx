import React, { Component } from "react";
import { Form, Modal, Radio, Button, message, Row, Input } from "antd";
import { connect } from "react-redux";
import { SUPPORT_LOCALES } from "config/locale.json";
import intl from "react-intl-universal";
import BraftEditor from 'braft-editor'

import course from "components/services/courseService";
import style from "assets/css/TitleTip.module.scss";

const controls = ['bold', 'list-ul', 'separator', 'link']

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

class TextEdit extends Component { 
    state = {
        visible: false,
        lang: this.props.route.currentLanguage.value,
        noData: true,
        languageList: null,
    }

    componentDidMount = () => {
        const { route: { currentLocation }, schoolId } = this.props;
        if (currentLocation) this.setState({ languageList: schoolId === '1' ? locale.lang : SUPPORT_LOCALES[currentLocation].lang });
    }

    componentWillReceiveProps(nextProps) {
        this.setState({noData: true}, ()=>{
            (nextProps.langInfo || []).forEach(item => {
                if(item.lang === this.state.lang) {
                this.setState({name: item.name, description: item.description});
                this.state.lang !== 'zh' && this.setState({noData: false});
                }
            })
        });
    }

    lang = (value) => {
        return this.props.translations.initDone && intl.get("course_1.content.edit." + value)
    }

    showModal = () => {
        this.setState({
          visible: true,
        });
        this.props.form.setFieldsValue({
          "title": this.props.name,
          "content": BraftEditor.createEditorState(this.props.description)
        })
    };

    handleCancel = e => {
        this.setState({
          visible: false,
          lang: this.props.route.currentLanguage.value
        });
        this.props.form.setFieldsValue({
          "title": this.props.name,
          "content": BraftEditor.createEditorState(this.props.description)
        })
    };

    onChange = e => {
        this.setState({lang: e.target.value}, () => {
            this.langChange(e.target.value, this.props.langInfo);
        })
    }

    langChange = (lang, lang_info) => {
        this.props.form.setFieldsValue({"title": "", "content": BraftEditor.createEditorState("")});
        this.setState({noData: true}, ()=>{
            (lang_info || []).forEach(item => {
                if(item.lang === lang) {
                this.props.form.setFieldsValue({
                    "title": item.name,
                    "content": BraftEditor.createEditorState(item.description)
                })
                if(lang !== 'zh') this.setState({noData: false});
                } 
            })
        });
    }
    
      

    handleSubmit = async (event) => {
        event.preventDefault();
        const value = this.props.form.getFieldsValue();
        const id = this.props.URLid;
        const { lang, noData } = this.state;
        const obj = {
          id,
          name: value.title, 
          description: value.content.toHTML()
        }
        await course.titleTipUpdate(obj, lang, noData).then(ret => {
          message.success('更改成功');
          this.handleCancel();
          typeof this.props.updateCallback === 'function' && this.props.updateCallback();
        }).catch(_msg => {
          console.log(_msg);
        })
    }

    render() {
        const { languageList } = this.state;
        const { form: { getFieldDecorator } } = this.props;

        return (
            <>
                <div onClick={this.showModal}>{this.props.children}</div>
                <Modal
                    title={
                    <Radio.Group value={this.state.lang} onChange={this.onChange}>
                        {(languageList || []).map((item, index) => (
                        <Radio.Button value={item.value} key={item.value + index}>{item.name}</Radio.Button>
                        ))}
                    </Radio.Group>
                    }
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    centered
                    footer={null}
                >
                    <Row className={style.form_container}>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Item label={this.lang('tiptitle')}>
                            {getFieldDecorator('title', {
                                rules: [{
                                required: true,
                                message: 'Title',
                                }],
                            })(
                                <Input size="large" placeholder="..." />
                            )}
                            </Form.Item>
                            <Form.Item label={this.lang('tiptext')}>
                            {getFieldDecorator('content', {
                                validateTrigger: 'onBlur',
                                rules: [{
                                required: true,
                                validator: (_, value, callback) => {
                                    if (value.isEmpty()) {
                                    callback('Write down something')
                                    } else {
                                    callback()
                                    }
                                }
                                }],
                            })(
                                <BraftEditor
                                className={style.editor}
                                controls={controls}
                                placeholder="..."
                                style={{maxHeight: 200, overflowX: 'hidden', border: '1px solid #d9d9d9', borderRadius: 4}}
                                />
                            )}
                            </Form.Item>
                            <Form.Item style={{textAlign: 'center'}}>
                                <Button size="large" type="primary" htmlType="submit">{this.lang('tipbtn')}</Button>
                            </Form.Item>
                        </Form>
                    </Row>
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
)(Form.create()(TextEdit));