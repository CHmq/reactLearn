import intl from "react-intl-universal";

function getPlus({ initDone, value, variable }) {
  return initDone && intl.get(value, variable);
}

export default {
  getPlus
};
