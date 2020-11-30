export function getCookie(key) {
  let arr,
    reg = new RegExp("(^| )" + key + "=([^;]*)(;|$)");
  if ((arr = document.cookie.match(reg))) return unescape(arr[2]);
  else return null;
}

export function setCookie(key, value) {
  const exp = new Date();
  exp.setTime(exp.getTime() + 60 * 60 * 48 * 1000); //过期时间 48小时
  document.cookie =
    key + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
  return value;
}

function removeCookie(key) {
  document.cookie = key + "=;expires=-1;path=/";
}

export default {
  getCookie,
  setCookie,
  removeCookie
};
