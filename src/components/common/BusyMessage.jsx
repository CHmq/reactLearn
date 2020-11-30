import { store } from "components/store";
import intl from "react-intl-universal";
import { message } from 'antd';

export default function () {
  const { translations } = store.getState();
  let value = translations.initDone && intl.get("general.msg.busy");
  message.error(value);
}