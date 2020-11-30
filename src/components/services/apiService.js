import { Client } from "aliyun-gateway-api";
import { APP_SETTINGS } from "config/app";
import { getKeyByValue } from "components/utils/helper";
import APICode from "config/api";
import uuid from "components/utils/uuid";
import BusyMessage from "components/common/BusyMessage";

let _successCallback = function(response) {
  if (
    typeof response.data !== "undefined" &&
    (!!("result" in response.data) && parseInt(response.data.result) === 1)
  ) {
    return response.data.data || response.data.result;
  } else {
    throw !!("result" in response.data) ? response.data : false;
  }
};
let _errorCallback = function(error) {
  let _msg = {
    result: 0,
    code: undefined,
    msg: undefined,
    data: undefined
  };
  if (
    error !== false &&
    ["object", "array"].indexOf(typeof error) > -1 &&
    !!("result" in error)
  ) {
    if ([20, 21, 22, 23, 24].indexOf(error.result) > -1) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("merchant_id");
    }
    var code = getKeyByValue(APICode, error.result);
    _msg = {
      result: error.result,
      code: code || undefined,
      msg: !!code ? code || undefined : undefined, // ($rootScope.lang().api)[code]
      data: typeof error.data !== "undefined" ? error.data : undefined
    };
  } else {
    console.error(error);
  }
  if(_msg.result === 0) {
    BusyMessage();
  }
  throw _msg;
};

let _client = new Client(APP_SETTINGS.AppKey, APP_SETTINGS.AppSecret);

_client._get = _client.get;
_client._post = _client.post;

_client.uploadOSS = function(_permit, file) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", function(e) {
      if (e.lengthComputable) {
//        console.log(e.loaded / e.total);
      }
    });
    xhr.upload.addEventListener("load", function() {
//      console.log("uploaded");
    });
    xhr.onreadystatechange = function() {
      // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE) {
        const ret = { code: this.status };
        if (this.status === 200) {
          ret.data = xhr.response;
          resolve(ret);
        } else {
          reject(ret);
        }
      }
    };
    xhr.open("PUT", _permit.sign_url);
    xhr.setRequestHeader("x-oss-callback", _permit["x-oss-callback"]);
    xhr.overrideMimeType(file.type);
    xhr.setRequestHeader("Content-Type", "");
    xhr.responseType = "json";
    xhr.send(file);
  })
    .then(_successCallback)
    .catch(_errorCallback);
};

_client.get = function(_opt, cache) {
  return _client
    ._get(_opt)
    .then(_successCallback)
    .catch(_errorCallback);
};
_client.post = function(opt) {
  let _opt = {
    ...opt,
    headers: {
      cbs: ((window.location.origin === process.env.REACT_APP_CBS_URL || !!opt.isCBS ) && 'on') || 'off'
    },
    form: {
      ...opt.form,
      device_id: getUUID(),
      access_token: (!!opt.form && opt.form.access_token) || getUToken(),
      merchant_id: (!!opt.form && opt.form.merchant_id) || getMID(),
      lang: (!!opt.form && opt.form.lang) || getLang()
    }
  };
//  console.log("api-post", _opt);
  return _client
    ._post(_opt)
    .then(_successCallback)
    .catch(_errorCallback);
};

export const client = _client;

export function setLang(i_lang) {
  return setLocal("lang", i_lang);
}

export function getLang() {
  let ret = getLocal("lang") || undefined;
  return ret;
}

export function getMID() {
  let ret = getLocal("merchant_id") || undefined;
  return ret;
}

export function setMID(i_token) {
  return setLocal("merchant_id", i_token);
}

export function setUToken(i_token) {
  return setLocal("access_token", i_token);
}

export function getUToken() {
  let ret = getLocal("access_token") || undefined;
  return ret;
}

export function getUUID() {
  let _UUID = getLocal("uuid") || uuid();
  return setLocal("uuid", _UUID);
}

function getLocal(key) {
  return localStorage.getItem(key);
}

export function setLocal(key, value) {
  if (!(value || "").trim()) {
    return delLocal(key);
  } else {
    localStorage.setItem(key, value);
  }
  return localStorage.getItem(key);
}

function delLocal(key) {
  localStorage.removeItem(key);
  return !localStorage.getItem(key);
}

export default {
  client
};
