import React, { Component } from "react";
import { Form, Input, Radio, Button, Select, message } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import { setRegistertKey } from "components/actions/auth_action";
import { cacheRegisterMsg } from "components/actions/auth_action";

import { goTipsPage } from "components/common/login/verify/otherLogin";

import { SUPPORT_LOCALES } from "config/locale.json";
import { PASSWORD } from "config/app.json";

import auth from "components/services/authService";
import user from "components/services/userService";

class Registration extends Component {
  state = {
    numSelect: "", // phone input 的 placeholder
    confirmDirty: false,
    family_token: "",
    _locale: "hk"
  };

  componentDidMount() {
    console.log(this.props);
    Object.keys(SUPPORT_LOCALES).map(_locale =>
      _locale !== this.props.route.currentLocation
        ? null
        : this.setState({ _locale })
    );
    this.setState({ family_token: this.props.familyToken });
  }

  //注冊按鈕
  HandleSubmit = async e => {
    e.preventDefault();
    const {
      state: { family_token },
      props: { defaultKey, RD_cacheRegisterMsg, RD_setRegistertKey }
    } = this;
    const value = this.props.form.getFieldsValue();

    RD_cacheRegisterMsg(value);
    RD_setRegistertKey(defaultKey);

    const type = this.props.type;
    const inputValue = {
      pre: value.prefix,
      tel: value.tel,
      email: value.email,
      pwd: value.password,
      sex: value.Sex,
      fsn: value.Firstname,
      lsn: value.Lastname,
      region: this.props.route.currentLocation,
      family_token
      // kid_token
    };
    await auth
      .register(type, inputValue)
      .then(ret => {
        return user.get(ret).then(_user => {
          if (_user.status === "VALID") {
            message.success("註冊成功");
            setTimeout(function() {
              window.location.href = "/";
            }, 1000);
          } else {
            this.props.data(1);
          }
          this.props.change(_user.status === "VERIFY" ? 1 : 3); //改变步骤条状态
        });
      })
      .catch(_msg => {
        message.warning(
          this.props.translations &&
            intl.get(
              "loading.publicMsg.register.form.occupied" +
                (_msg.result === 207 ? "_kid" : "")
            )
        );
      });
  };

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback(
        this.props.translations &&
          intl.get("loading.publicMsg.register.form.verifyMsg.confirmWarnMsg")
      );
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(["confirm"], { force: true });
    }
    callback();
  };

  //提交按钮是否禁用判断
  vaIidate = () => {
    const { getFieldsError, getFieldsValue } = this.props.form;
    const type = this.props.type === "tel" ? "tel" : "email";

    let _fields = [type, "password", "Sex", "Firstname"];
    if (this.props.auth.userState === "register") {
      _fields = [type, "Sex", "Firstname"];
    }

    const value = Object.values(getFieldsValue(_fields)).every(
      item => item !== undefined && item !== ""
    );
    const error = Object.values(getFieldsError(_fields)).every(
      item => item === "" || item === undefined
    );
    return value === true && error === true ? false : true;
  };

  //設置phone input框的placeholder值
  handleSelect = value => {
    switch (value) {
      case "852":
        this.setState({ numSelect: "+852 61234567" });
        break;
      case "853":
        this.setState({ numSelect: "+853 66123456" });
        break;
      case "60":
        this.setState({ numSelect: "+60 123456789" });
        break;
      default:
        this.setState({ numSelect: "+86 13123456789" });
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { _locale } = this.state;

    const formItemLayout = {
      labelCol: {
        lg: { span: 6 },
        md: { span: 24 },
        sm: { span: 24 },
        xs: { span: 24 }
      },
      wrapperCol: {
        lg: { span: 18 },
        md: { span: 24 },
        sm: { span: 24 },
        xs: { span: 24 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        md: {
          span: 18,
          offset: 6
        },
        sm: {
          span: 24
        },
        xs: {
          span: 24
        }
      }
    };
    const prefixSelector = getFieldDecorator("prefix", {
      initialValue: SUPPORT_LOCALES[this.props.route.currentLocation].tel
    })(
      <Select onChange={this.handleSelect} style={{ width: 100 }}>
        {/* {Object.keys(SUPPORT_LOCALES).map(_locale => {
          return _locale !== this.props.route.currentLocation ? null : (
            <Select.Option
              key={_locale}
              value={SUPPORT_LOCALES[_locale].tel}
            >{`${_locale.toUpperCase()}(+${
              SUPPORT_LOCALES[_locale].tel
            })`}</Select.Option>
          );
        })} */}
        <Select.Option
          key={_locale}
          value={SUPPORT_LOCALES[_locale].tel}
        >{`${_locale.toUpperCase()}(+${
          SUPPORT_LOCALES[_locale].tel
        })`}</Select.Option>
      </Select>
    );

    const {
      type,
      translations,
      defaultKey,
      auth: { loginCode, userState, key, msg}
    } = this.props;
    // 多语言
    const _fn = function(value) {
      return (
        (translations.initDone &&
          intl.get("loading.publicMsg.register.form." + value)) ||
        ""
      );
    };

    const Language = {
      phone: _fn("phone"),
      verifyphoneMsg: _fn("verifyMsg.phoneMsg"),
      verifyphone: _fn("verifyMsg.phone"),
      phoneWarnMsg: _fn("verifyMsg.phoneWarnMsg"),

      email: _fn("email"),
      verifyemailMsg: _fn("verifyMsg.emailMsg"),

      pwd: _fn("pwd"),
      pwdMsg: _fn("verifyMsg.pwdMsg"),
      pwdWarnMsg: _fn("verifyMsg.pwdWarnMsg"),

      confirmpwd: _fn("confirmpwd"),
      confirmMsg: _fn("verifyMsg.confirmMsg"),

      sex: _fn("sex"),
      man: _fn("man"),
      lady: _fn("lady"),

      name: _fn("name"),
      verifyname: _fn("verifyMsg.name"),
      nameMsg: _fn("verifyMsg.nameMsg"),
      // nameMsg: _fn("verifyMsg.nameMsg"),

      surname: _fn("surname"),
      verifysurname: _fn("verifyMsg.surname"),
      surnameMsg: _fn("verifyMsg.surnameMsg"),

      btn: _fn("btn"),

      _return: _fn("return")
    };

    const phoneNumRule = (region) => {
      switch (region) {
        case 'cn' :
          return /^[1][3-8]\d{9}$/;
        case 'hk' :
          return /^(5|6|8|9)\d{7}$/
        case 'mo' :
          return /^[1-9]\d{7}$/
        case 'my' : 
          return /^[0-9]\d{8}$/
        default :
          return /^(5|6|8|9)\d{7}$/
      }
    }

    return (
      <Form {...formItemLayout} onSubmit={this.HandleSubmit}>
        {type === "tel" ? (
          <Form.Item
            label={Language.phone}
            hasFeedback
            help={Language.verifyphoneMsg}
          >
            {getFieldDecorator("tel", {
              rules: [
                {
                  required: true,
                  message: Language.verifyphone
                },
                {
                  pattern: phoneNumRule(_locale),
                  message: Language.phoneWarnMsg
                }
              ],
              initialValue: key === defaultKey ? msg && msg.tel : ""
            })(
              <Input
                addonBefore={prefixSelector}
                placeholder={this.state.select}
              />
            )}
          </Form.Item>
        ) : (
          <Form.Item label={Language.email} hasFeedback>
            {getFieldDecorator("email", {
              rules: [
                {
                  type: "email",
                  message: Language.emailWarnMsg
                },
                {
                  required: true,
                  message: Language.emailMsg
                }
              ],
              initialValue: key === defaultKey ? msg && msg.email : ""
            })(<Input />)}
          </Form.Item>
        )}
        {loginCode !== 302 && (
          <Form.Item label={Language.pwd} hasFeedback>
            {getFieldDecorator("password", {
              rules: [
                {
                  required: true,
                  message: Language.pwdMsg
                },
                {
                  pattern: PASSWORD,
                  message: Language.pwdWarnMsg
                },
                {
                  validator: this.validateToNextPassword
                }
              ],
              initialValue: key === defaultKey ? msg && msg.password : ""
            })(<Input.Password />)}
          </Form.Item>
        )}
        <Form.Item label={Language.sex}>
          {getFieldDecorator("Sex", {
            rules: [
              {
                required: true
              }
            ],
            initialValue: key === defaultKey ? msg && msg.Sex : ""
          })(
            <Radio.Group>
              <Radio value="M">{Language.man}</Radio>
              <Radio value="F">{Language.lady}</Radio>
            </Radio.Group>
          )}
        </Form.Item>
        <Form.Item label={Language.name} hasFeedback>
          {getFieldDecorator("Firstname", {
            rules: [
              {
                required: true,
                message: Language.nameMsg
              },
              {
                whitespace: true,
                message: Language.verifyname
              }
            ],
            initialValue: key === defaultKey ? msg && msg.Firstname : ""
          })(<Input placeholder={Language.nameMsg} />)}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit" disabled={this.vaIidate()}>
            {Language.btn}
          </Button>
          <br />
          {userState === "register" && !this.props.pageKey && (
            /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
            <a onClick={() => goTipsPage(this.props)}>{Language._return}</a>
          )}
        </Form.Item>
      </Form>
    );
  }
}
function mapStateToProps({ auth, route, user, translations }) {
  return {
    auth,
    route,
    user,
    translations
  };
}

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    initRoute: payload => dispatch({ type: "initRoute", payload }),
    initUserData: payload => dispatch({ type: "INIT", payload }),
    updateFileName: payload => dispatch({ type: "updateFileName", payload }),
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload }),
    RD_setRegistertKey: key => dispatch(setRegistertKey(key)),
    RD_cacheRegisterMsg: msg => dispatch(cacheRegisterMsg(msg))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(Registration));
