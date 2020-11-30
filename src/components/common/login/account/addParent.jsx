import React, { Component } from "react";
import { Form, Input, Button, Select, Divider } from "antd";
import { connect } from "react-redux";
// import intl from "react-intl-universal";

import intl from "components/utils/language";
import toast from "components/utils/toast";

import family_API from "components/services/familyService";

import loginBasics from "assets/css/login/basics.module.scss";

const headerPosition = "home.publicMsg.role.addParent";

const roleList = [
  { key: "FATHER" },
  { key: "MOTHER" },
  { key: "MATERNAL_GRANDFATHER" },
  { key: "MATERNAL_GRANDMOTHER" },
  { key: "PATERNAL_GRANDFATHER" },
  { key: "PATERNAL_GRANDMOTHER" },
  { key: "OTHER" }
];

export class addParent extends Component {
  state = {
    viewState: {
      submitLoading: false
    },
    viewValue: {
      role: "FATHER"
    }
  };

  /** switch role */
  roleChange = role => this.setState({ viewValue: { role } });

  /** submit state */
  switchSubmitLoading = () => {
    const {
      state: {
        viewState: { submitLoading }
      }
    } = this;
    this.setState({ viewState: { submitLoading: !submitLoading } });
  };

  /** 新增家長 erros */
  addParentErrors = code => {
    const { switchSubmitLoading } = this;
    const errors = new Map()
      .set(1, () =>
        toast.createToast({
          msg: "邀請發送成功請等待對方接受邀請",
          onClose: () => switchSubmitLoading()
        })
      )
      .set(211, () => {
        // console.log(data)
        toast.createToast({
          msg:
            "已成功發送邀請，邀請連結已傳送到對方的電子郵箱或手機短訊信箱。 ",
          onClose: () => {
            switchSubmitLoading();
            this.goBack();
          }
        });
      })
      .set(206, () => {
        // console.log(data)
        toast.createToast({
          msg: "該電子郵箱或手機短訊信箱已被註冊 ",
          onClose: () => switchSubmitLoading()
        });
      });
    errors.get(code)
      ? errors.get(code)()
      : toast.createToast({
          type: "error",
          msg: "發生了未知錯誤,請重試",
          onClose: () => switchSubmitLoading()
        });
  };

  /** 新增家长 */
  handleSubmit = async e => {
    e.preventDefault();
    const {
      props: {
        $location,
        form: { getFieldsValue },
        user: { language },
        auth: {
          AddKidMsg: { family_id }
        }
      },
      state: {
        viewValue: { role }
      },
      switchSubmitLoading,
      addParentErrors,
      validate
    } = this;
    if (validate())
      return toast.createToast({
        type: "error",
        msg: "請填寫郵箱或電話號碼!",
        onClose: () => switchSubmitLoading()
      });
    const { email, tel } = getFieldsValue();
    switchSubmitLoading();
    try {
      email
        ? await family_API.addChildren({ email, language, family_id, role, $location })
        : await family_API.addChildren({ tel, language, family_id, role, $location });
    } catch (error) {
      addParentErrors(error.result);
    }
  };

  /** 回到家长编辑view */
  goBack = () => {
    const {
      props: { UPDATE_AUTH }
    } = this;
    UPDATE_AUTH({ userState: "" });
  };

  /** 簡單驗證 */
  validate = () => {
    const {
      props: {
        form: { getFieldsValue }
      }
    } = this;
    const { email, tel } = getFieldsValue();
    console.log(email, tel, email || tel);
    if (email || tel) return false;
    return true;
  };
  render() {
    const {
      props: {
        form: { getFieldDecorator },
        translations: { initDone }
      },
      state: {
        viewState: { submitLoading },
        viewValue: { role }
      },
      validate,
      roleChange
    } = this;
    const { Option } = Select;
    return (
      <React.Fragment>
        <h2 className={loginBasics.title}>
          {intl.getPlus({ initDone, value: `${headerPosition}.title` })}
        </h2>
        <Form onSubmit={this.handleSubmit} style={{ padding: 50 }}>
          <Form.Item>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.form.msg_tips`
            })}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("email", {
              rules: [
                {
                  message: intl.getPlus({
                    initDone,
                    value: `${headerPosition}.form.email`
                  })
                }
              ]
            })(
              <Input
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.email`
                })}
                name="email"
              />
            )}
          </Form.Item>
          <Divider>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.form.or`
            })}
          </Divider>
          <Form.Item>
            {getFieldDecorator("tel", {
              rules: [
                {
                  message: intl.getPlus({
                    initDone,
                    value: `${headerPosition}.form.tel`
                  })
                }
              ]
            })(
              <Input
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.tel`
                })}
                name="tel"
              />
            )}
          </Form.Item>
          <Form.Item>
            {intl.getPlus({
              initDone,
              value: `${headerPosition}.form.relationship`
            })}
            :
            <Select onChange={roleChange} value={role}>
              {roleList.map(item => (
                <Option value={item.key} key={item.key}>
                  {intl.getPlus({
                    initDone,
                    value: `${headerPosition}.form.${item.key}`
                  })}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={validate()}
              loading={submitLoading}
            >
              {intl.getPlus({
                initDone,
                value: `${headerPosition}.save`
              })}
            </Button>
            <br />
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={this.goBack}>
              {intl.getPlus({
                initDone,
                value: `${headerPosition}.return`
              })}
            </a>
          </Form.Item>
        </Form>
      </React.Fragment>
    );
  }
}

/** redux 數據獲取
 * user 用戶信息
 * auth 登錄信息
 */
function mapStateToProps({ user, auth, translations }) {
  return { user, auth, translations };
}

/**
 * redux 更新數據
 * UPDATE_AUTH 更新 modal_view
 */
function mapDispatchToProps(dispatch) {
  return {
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(addParent));
