import {
  UPDATE_AUTH,
  SET_REGISTEERTKEY,
  CACHE_REGISTERMSG
} from "components/actions/auth_action";

// auth reducer 派发
export const auth = (state = {}, { type, payload, key, msg }) => {
  switch (type) {
    case UPDATE_AUTH:
      return { ...state, ...payload };
    case SET_REGISTEERTKEY:
      return { ...state, key };
    case CACHE_REGISTERMSG:
      return { ...state, msg };
    default:
      return state;
  }
};
