import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Input, Select } from "antd";
import { toast, Flip } from "react-toastify";
// import { connect } from "react-redux";

import intl from "components/utils/language";

import user_API from "components/services/userService";


const translationPosition = "home.publicMsg.role.edit.userEdit";

const { Option } = Select;

const relationList = [
  { key: "FATHER" },
  { key: "MOTHER" },
  { key: "MATERNAL_GRANDFATHER" },
  { key: "MATERNAL_GRANDMOTHER" },
  { key: "PATERNAL_GRANDFATHER" },
  { key: "PATERNAL_GRANDMOTHER" },
  { key: "OTHER" }
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 }
  }
};

// 個人信息 編輯 界面
function Edit({ user, form, editClose, translations: { initDone }, hiddenRelation }) {
  // hook -- state
  //    sex 用戶性別 如果沒有 默認 M
  //    relation 關係 如果沒有 默認 FATHER
  const _user = (user.family || []).filter(_fM => {
      return _fM.permit_user === user.id;
  });

  const [loading, setLoading] = useState(false)

  const [sex, setSex] = useState(_user.length > 0 ? _user[0].permit_user_sex  : "M");
  const [relation, setRelation] = useState(_user.length > 0 ? _user[0].relation : "FATHER");

  // hook -- function
  //    初始化 用戶姓名
  useEffect(() => {
    const { setFieldsValue } = form;
    setFieldsValue({ name: user.first_name || null });
  }, [0]);

  const { getFieldDecorator, getFieldValue } = form;

  // 保存 編輯後的數據
  const saveEdit = async e => {
    setLoading(true);
    e.preventDefault();
    const id = createToast({
      type: "info",
      msg: intl.getPlus({
        initDone,
        value: `general.msg.uploading`
      }),
      autoClose: false,
      hideProgressBar: true
    });
    try {
      await user_API.updateUserMsg({
        first_name: getFieldValue("name"),
        sex,
        relation
      });
      editClose();
      createUpdateToast({
        id,
        render: intl.getPlus({
          initDone,
          value: `general.msg.update_success`
        }),
        type: toast.TYPE.SUCCESS,
        position: "top-center",
        transition: Flip,
        // onClose: () => this.setState({ uploading })
      });
    } catch (ex) {
      console.error(ex);
      setLoading(false);
      if (!!ex) {
        this.uploadingErrors({ result: ex.result, id, loading });
      }
    }
    setLoading(false);
  };

  function createToast({
    type,
    msg,
    position = "top-center",
    autoClose = 3000,
    hideProgressBar = false,
    onOpen,
    onClose
  }) {
    return toast[type](msg, {
      position,
      autoClose,
      hideProgressBar,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onOpen,
      onClose
    });
  };

  function createUpdateToast({
    id,
    render,
    position = "top-right",
    type = toast.TYPE.ERROR,
    transition,
    autoClose = 3000,
    hideProgressBar = false,
    onOpen
  }) {
    toast.update(id, {
      render,
      position,
      type,
      transition,
      autoClose,
      hideProgressBar,
      onOpen
    });
  };

  function uploadingErrors({ result, id, uploading }) {
    switch (result) {
      case 21:
        return this.createUpdateToast({
          id,
          render: intl.getPlus({
            initDone,
            value: `general.msg.no_right`
          }),
          uploading
        });
      default:
        return this.createUpdateToast({
          id,
          render: intl.getPlus({
            initDone,
            value: `general.msg.upload_failed`
          }),
          uploading
        });
    }
  };

  return (
    <Modal
      visible={true}
      bodyStyle={{ backgroundColor: "#fff" }}
      title={intl.getPlus({
        initDone,
        value: `${translationPosition}.title`
      })}
      onCancel={editClose}
      centered
      footer={null}
    >
      <Form onSubmit={saveEdit} className="login-form">
        <Form.Item
          {...formItemLayout}
          label={intl.getPlus({
            initDone,
            value: `${translationPosition}.name`
          })}
        >
          {getFieldDecorator("name", {
            rules: [{ message: "Please input your name!" }]
          })(<Input placeholder="name" />)}
        </Form.Item>
        <Form.Item
          {...formItemLayout}
          label={intl.getPlus({
            initDone,
            value: `${translationPosition}.gender.title`
          })}
        >
          <Select value={sex} onChange={e => setSex(e)}>
            <Option value="M">
              {intl.getPlus({
                initDone,
                value: `${translationPosition}.gender.M`
              })}
            </Option>
            <Option value="F">
              {intl.getPlus({
                initDone,
                value: `${translationPosition}.gender.F`
              })}
            </Option>
          </Select>
        </Form.Item>
        { user_API.getType() !== "STUDENT" && !hiddenRelation && (<Form.Item
          {...formItemLayout}
          label={intl.getPlus({
            initDone,
            value: `${translationPosition}.relation.title`
          })}
        >
          <Select
            onChange={e => setRelation(e)}
            value={relation}
          >
            {relationList.map(item => (
              <Option value={item.key} key={item.key}>
                {intl.getPlus({
                  initDone,
                  value: `${translationPosition}.relation.${item.key}`
                })}
              </Option>
            ))}
          </Select>
        </Form.Item>)}
        <Form.Item>
          <Button
            block
            type="primary"
            htmlType="submit"
            className="login-form-button"
            loading={loading}
          >
            {intl.getPlus({
              initDone,
              value: `${translationPosition}.save`
            })}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

// function mapStateToProps({ route, user, translations }) {
//   return {
//     route,
//     user,
//     translations
//   };
// }

// /** redux 數據更新
//  * initLanguageState  初始化 language  bool
//  * updateTranslations 更新language 以渲染多语言
//  */
// function mapDispatchToProps(dispatch) {
//   return {
//     updateFileName: payload => dispatch({ type: "updateFileName", payload })
//   };
// }

const userEdit = Form.create()(Edit);
export default userEdit;
