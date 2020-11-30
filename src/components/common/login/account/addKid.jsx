import React, { Component } from "react";
import { Form, Input, Button, Select, Row, Col } from "antd";
import { connect } from "react-redux";
// import intl from "react-intl-universal";
import intl from "components/utils/language";

import toast from "components/utils/toast";

import family_API from "components/services/familyService";
import user_API from "components/services/userService";

import loginBasics from "assets/css/login/basics.module.scss";

const grades = ["PN", "K1", "K2", "K3"];

/**
 * 新增子女view
 *
 * @export
 * @class addKid
 * @extends {Component}
 */
export class addKid extends Component {
  /** state
   *
   *  kidMsg 當前kid 信息 Object
   *      gender  性別 string
   *
   *  viewState 視圖State Object
   *      submitLoading 登錄狀態 bool
   */
  state = {
    kidMsg: {
      gender: "M",
      grade_type: grades[0]
    },
    viewState: {
      submitLoading: false
    }
  };

  /** 更新性別選擇
   * gender    當前性別
   */
  genderOnChange = gender => {
    this.setState({ kidMsg: { ...this.state.kidMsg, gender } });
  };

  /** 表單驗證
   * 目前只有非空驗證 可通過 antD 添加
   */
  verifySubmit = () => {
    const {
      props: {
        form: { getFieldsValue }
      }
    } = this;
    // 非空验证
    const { first_name } = getFieldsValue();
    if (!first_name) return true;
    // const { first_name, last_name, grade_type } = getFieldsValue();
    // if (!(!!first_name && !!last_name && !!grade_type)) return true;
    return false;
  };

  /** addKidErrors 新增子女 errors 處理
   * code errors 狀態碼
   */
  addKidErrors = code => {
    const { switchSubmitLoading } = this;
    const errors = new Map().set(203, () =>
      toast.createToast({
        type: "error",
        msg: "該帳號已經綁定了kid帳戶!",
        onClose: () => {
          switchSubmitLoading();
          window.location = "/";
        }
      })
    );
    return errors.get(code)
      ? errors.get(code)()
      : toast.createToast({
          type: "error",
          msg: "發現了未知的錯誤",
          onClose: () => switchSubmitLoading()
        });
  };

  /** viewState submitButton 狀態切換 */
  switchSubmitLoading = () => {
    const {
      state: {
        viewState: { submitLoading }
      }
    } = this;
    this.setState({ viewState: { submitLoading: !submitLoading } });
  };

  /** 新增子女 表單提交
   * e  事件對象
   */
  handleSubmit = async e => {
    e.preventDefault();
    const {
      state: {
        kidMsg: { gender: sex, grade_type }
      },
      props: {
        form: { getFieldsValue },
        user: { language },
        auth: {
          kid_token,
          AddKidMsg: { family_id }
        },
        UPDATE_AUTH,
        initUserData
      },
      verifySubmit,
      addKidErrors,
      switchSubmitLoading
    } = this;
    switchSubmitLoading();
    if (verifySubmit())
      return toast.createToast({
        type: "error",
        msg: "各项信息不能为空!",
        onClose: () => switchSubmitLoading()
      });
    // const { first_name, last_name, grade_type } = getFieldsValue();
    const { first_name } = getFieldsValue();
    try {
      const user_id = await family_API.addChildren({
        sex,
        first_name,
        // last_name,
        language,
        grade_type,
        family_id
      });
      if (!kid_token)
        return toast.createToast({
          msg: "請先登錄子女帳戶!",
          onOpen: async () => initUserData(await user_API.me(true)),
          onClose: () => {
            switchSubmitLoading();
            UPDATE_AUTH({ loginCode: 401, userState: "" });
          }
        });

      await family_API.bindChlidren({
        kid_token,
        user_id
      });
      await user_API.swap({ user_id });
      toast.createToast({
        type: "success",
        // msg: `新增成功,將以子女${last_name + first_name}身份登入.`,
        msg: `新增成功,將以子女${first_name}身份登入.`,
        onClose: () => {
          switchSubmitLoading();
          window.location = "/";
        }
      });
    } catch (error) {
      console.log(error);
      addKidErrors(error.result);
    }
  };

  /** 更新 modal_veiw 切換 */
  goBack = () => {
    const { UPDATE_AUTH } = this.props;
    UPDATE_AUTH({ userState: "" });
  };

  render() {
    const {
      props: {
        form: { getFieldDecorator },
        translations: { initDone }
      },
      state: {
        kidMsg: { gender },
        viewState: { submitLoading }
      },
      verifySubmit
    } = this;
    const { Option } = Select;
    const headerPosition = "home.publicMsg.role.addKid";

    return (
      <div>
        <h2 className={loginBasics.title}>
          {intl.getPlus({ initDone, value: `${headerPosition}.title` })}
        </h2>
        <Row type="flex" justify="space-around">
          <Col style={{ textAlign: "center" }}>
            <img
              src={require("assets/image/logo.png")}
              alt=""
              style={{ width: "80%" }}
            />
          </Col>
        </Row>
        <Form onSubmit={this.handleSubmit} style={{ padding: "20px 50px" }}>
          <Form.Item>
            {getFieldDecorator("first_name", {
              rules: [{ required: true, message: "Please input your name!" }]
            })(
              <Input
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.f_name`
                })}
                name="first_name"
              />
            )}
          </Form.Item>
          {/* <Form.Item>
            {getFieldDecorator("last_name", {
              rules: [{ required: true, message: "Please input your name!" }]
            })(
              <Input
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.l_name`
                })}
                name="last_name"
              />
            )}
          </Form.Item> */}
          <Form.Item>
            <Select value={gender} onChange={this.genderOnChange}>
              <Option value="M">
                {intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.gender.M`
                })}
              </Option>
              <Option value="F">
                {intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.gender.F`
                })}
              </Option>
            </Select>
          </Form.Item>
          <Form.Item>
            {/* {getFieldDecorator("grade_type", {
              rules: [{ required: true, message: "Please input your grade!" }]
            })(
              <Input
                placeholder={intl.getPlus({
                  initDone,
                  value: `${headerPosition}.form.grade`
                })}
                name="grade_type"
              />
            )} */}
            <Select
              defaultValue={grades[0]}
              style={{ width: 120 }}
              onChange={grade_type =>
                this.setState({ kidMsg: { ...this.state.kidMsg, grade_type } })
              }
            >
              {grades.map(grade => (
                <Option value={grade}>{grade}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ textAlign: "center" }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={verifySubmit()}
              loading={submitLoading}
            >
              {intl.getPlus({
                initDone,
                value: `${headerPosition}.addAccount`
              })}
            </Button>
            <br />
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a onClick={this.goBack}>
              {intl.getPlus({ initDone, value: `${headerPosition}.return` })}
            </a>
          </Form.Item>
        </Form>
      </div>
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
    UPDATE_AUTH: payload => dispatch({ type: "UPDATE_AUTH", payload }),
    initUserData: payload => dispatch({ type: "INIT", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(addKid));
