/**
 * Action_Type 定义
 */

/**
 * old_Version 待完善...
 */
export const UPDATE_AUTH = "UPDATE_AUTH";

/**
 * 用户注册所选取的方式索引
 */
export const SET_REGISTEERTKEY = "SET_REGISTEERTKEY";
/**
 * 用户註冊時填写的信息缓存
 */
export const CACHE_REGISTERMSG = "CACHE_REGISTERMSG";

export function updateAuth(data) {
  return { type: UPDATE_AUTH, data };
}

/**
 * @param {phone/email KEY} Key 用户注册所选用的方式--索引 string["1", "2"]
 */
export function setRegistertKey(key) {
  return { type: SET_REGISTEERTKEY, key };
}

/**
 *
 * @param {userMessage} msg 缓存用户註冊時填写的信息 Object
 */
export function cacheRegisterMsg(msg) {
  return { type: CACHE_REGISTERMSG, msg };
}

export default {
  UPDATE_AUTH,
  SET_REGISTEERTKEY,
  CACHE_REGISTERMSG
};
