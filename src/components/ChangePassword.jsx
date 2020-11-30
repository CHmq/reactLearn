import React, { Component } from "react";
import { Button, Form , Input, message } from "antd";
import auth from "./services/userService";
import { PASSWORD } from "config/app.json";
import { connect } from "react-redux";
import intl from "react-intl-universal";

class ChangePassword extends Component {

  state = {
    confirmDirty: false,
  }

  //確認修改按鈕
  HandleSubmit = async e => {
    e.preventDefault();
    const { translations, onCancel } = this.props;
    const value = this.props.form.getFieldsValue();
    await auth
      .changePwd(value)
      .then(ret => {
        message.success(translations.initDone && intl.get(`general.msg.update_success`));
        onCancel();
        return ret;
      })
      .catch(_msg => {
        console.log(_msg);
        message.warning(translations.initDone && intl.get(`general.error.wrong_pw`));
      });
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  //判斷新舊密碼是否一致
  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    const { translations } = this.props;
    if (value && value === form.getFieldValue("oldpassword")) {
      callback(translations.initDone && intl.get(`general.error.cannot_use_old_pw`));
    }
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  };

  //判斷兩次輸入的密碼是否一致
  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    const { translations } = this.props;
    if (value && value !== form.getFieldValue("password")) {
      callback(translations.initDone && intl.get(`general.error.confirm_pw_error`));
    } else {
      callback();
    }
  };

  //提交按钮是否禁用判断
  vaIidate = () => {
    const { getFieldsError, getFieldsValue } = this.props.form;
    const value = Object.values(
      getFieldsValue(["password", "confirm", "oldpassword"])
    ).every(item => item !== undefined && item !== "");
    const error = Object.values(
      getFieldsError(["password", "confirm", "oldpassword"])
    ).every(item => item === "" || item === undefined);
    return value === true && error === true ? false : true;
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { translations } = this.props;
    const _lang = function(value) {
      return translations.initDone && intl.get(`loading.forget.` + value);
    };
    
    const formItemLayout = {
      labelCol: {
        md: { span: 8 },
        sm: { span: 24 },
        xs: { span: 24 }
      },
      wrapperCol: {
        md: { span: 16 },
        sm: { span: 24 },
        xs: { span: 24 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        md: {
          span: 16,
          offset: 8
        },
        sm: {
          span: 24
        },
        xs: {
          span: 24
        }
      }
    };

    return (
      <Form {...formItemLayout} onSubmit={this.HandleSubmit}>
        <Form.Item label={_lang("old_password")} hasFeedback>
          {getFieldDecorator("oldpassword", {
            rules: [
              {
                required: true,
                message: _lang("passwordnull")
              },
              {
                pattern: PASSWORD,
                message: _lang("passwordrule")
              }
            ]
          })(<Input.Password />)}
        </Form.Item>
        <Form.Item label={_lang("password")} hasFeedback>
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: _lang("passwordnull")
              },
              {
                pattern: PASSWORD,
                message: _lang("passwordrule")
              },
              {
                validator: this.validateToNextPassword
              }
            ]
          })(<Input.Password />)}
        </Form.Item>
        <Form.Item label={_lang("confirm_password")} hasFeedback>
          {getFieldDecorator("confirm", {
            rules: [
              {
                required: true,
                message: _lang("passwordconfirm")
              },
              {
                validator: this.compareToFirstPassword
              }
            ]
          })(<Input.Password onBlur={this.handleConfirmBlur} />)}
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" disabled={this.vaIidate()}>
            { translations.initDone && intl.get(`general.button.confirm`) }
          </Button>        
        </Form.Item>
      </Form>
    );
  }
}
  
function mapStateToProps({ route, user, auth, translations }) {
  return {
    route,
    user,
    auth,
    translations
  };
}

function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(ChangePassword));
