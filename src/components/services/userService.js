import {
  client,
  setLang,
  setUToken,
  getUToken,
  setMID,
  getMID,
  getUUID
} from "components/services/apiService";


const url = `${process.env.REACT_APP_API_URL_USER}/user`;

class userService {
  $$init = false;
  $$loading = false;
  $$user = null;
  initTime = 0;
  merchant_id = null;

  //My data
  me = async (i_force = false) => {
    if (!i_force && !!this.$$loading) {
      return this.$$loading;
    }
    if (
      !i_force &&
      !!this.$$user &&
      Date.now() - this.initTime <= 30 * 60 * 1000
    ) {
      return this.$$user;
    }
    this.$$init = true;

    if(!this.getUToken()) {
        throw new Error("NOT_EXISTS_TOKEN");
    }
    this.$$loading = client
      .post({
        url: `${url}/get`,
        form: {}
      })
      .then(user => {
        this.$$user = user;
        this.initTime = Date.now();
        return user;
      })
      .catch(err => {
        this.$$loading = false;
        this.$$user = null;
        this.initTime = null;
        throw err;
      })
      .then(ret => {
        this.$$loading = false;
        return ret;
      });
    return this.$$loading;
  };

  // 获得用户数据
  get = async (access_token = "") => {
    return client.post({
      url: `${url}/get`,
      form: {
        access_token
      }
    });
  };

  getUserData = this.me;

  /**
   * 切換用戶
   * @param {String} user_id User ID
   * @param {String} [password] If user_type == "PARENT" , password required.
   * @returns {Promise} Promise type return
   */
  swap = async ({ user_id, password = null }) => {
    return client
      .post({
        url: `${url}/swap`,
        form: {
          user_id,
          password
        }
      })
      .then(_UToken => {
        setMID("");
        return setUToken(_UToken);
      });
  };

  changePwd = async value => {
    return await client.post({
      url: `${url}/update_password`,
      form: {
        old_password: value.oldpassword,
        password: value.password
      }
    });
  };

  checkPassword = async password => {
    return await client.post({
      url: `${url}/check_password`,
      form: {
        password
      }
    });
  }

  updateUserMsg = async ({ first_name, sex, relation }) => {
    return client.post({
      url: `${url}/update`,
      form: {
        first_name,
        sex,
        relation
      }
    });
  };

  uploadingAvatar = this.uploadImg;

  uploadProfile = async (_permit, file) => {
    return client.uploadOSS(_permit, file);
  };

  getProfilePermit = async i_fileMeta => {
    return this.getUploadPermit("user", "profile", i_fileMeta);
  };

  getUploadPermit = async (
    i_controller,
    i_action,
    i_fileMeta,
    i_formData = {}
  ) => {
    var meta = {
      lastModified: i_fileMeta.lastModified,
      lastModifiedDate: i_fileMeta.lastModifiedDate,
      name: i_fileMeta.name,
      size: i_fileMeta.size,
      type: i_fileMeta.type
    };
    const formData = Object.assign({}, { meta: meta }, i_formData);
    return client.post({
      url: `${process.env.REACT_APP_API_URL_USER}/upload/token/${i_controller}/${i_action}`,
      form: formData
    });
  };

  staff = (merchant_id = null) => {
    if (this.$$user === null || this.$$user.type !== "PARENT") {
      return null;
    }
    let _staff = null;
    merchant_id = merchant_id || this.getMID() || null;
    if (merchant_id !== null) {
      let _staffList = this.$$user.staff.filter(
        staff => "" + staff.merchant_id === "" + merchant_id
      );
      _staff = _staffList.length > 0 ? _staffList[0] : null;
    } else if (
      Array.isArray(this.$$user.staff) &&
      this.$$user.staff.length > 0
    ) {
      _staff = this.$$user.staff[0];
    }
    return _staff;
  };

  isStaff = (merchant_id = null) => {
    if (this.$$user === null || this.$$user.type !== "PARENT") {
      return false;
    }
    if (merchant_id !== null) {
      return this.staff(merchant_id) !== null;
    }
    return Array.isArray(this.$$user.staff) && this.$$user.staff.length > 0;
  };

  setMID = (merchant_id = null) => {
    if (!!this.staff(merchant_id)) {
      setMID(merchant_id);
      return true;
    }
    return false;
  };

  getUToken = () => getUToken();

  getMID = () => getMID();

  getType = () => {
    return this.isStaff() ? "STAFF" : (this.$$user || { type: null }).type;
  };

  getStatus = () => {
    return (this.$$user || { status: null }).status;
  };
  
  getIntranet = () => {
    return (this.$$user || { intranet: [] }).intranet;
  };
  
  getRoleGroupList = () => {
    return (this.$$user || { role_group_list: [] }).role_group_list;
  };
  
  checkRPermit = () => {
    return this.getRoleGroupList().indexOf("USER_RESOURCE") > 0;
  };

  getUUID = () => getUUID();

  getUser = () => {
    return this.$$user !== null ? this.$$user : this.me();
  };
  setLang = i_lang => {
    setLang(i_lang);
    return this;
  };

    isInit = () => {
        return this.$$init;
    }
  isLoading = () => {
    return this.$$loading;
  };
    goIntranet = async(real_url) => {
        return client.post({
            url: `${url}/intranet`,
            form: { page: real_url }
        });
    }

  goResource = async res_id => {
    return client.post({
      url: `${url}/resource`,
      form: { res_id }
    });
  };

  getVerify = async (i_input = "") => {
    return client.post({
      url: `${url}/send_reset`,
      form: {
        input: i_input
      }
    });
  };

  resetPW = async (i_input = "", i_password = "", i_vCode = "") => {
    return client.post({
      url: `${url}/reset_password`,
      form: {
        input: i_input,
        password: i_password,
        vcode: i_vCode
      }
    });
  };
}

const user = new userService();

export default user;