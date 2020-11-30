import user from "components/services/userService";

class staffService {

    $$loading = false;
    $$user = user;

    isLoading = () => {
        return this.$$user.isLoading();
    }

    me = () => {
        return this.$$user.staff();
    }

    /**
     * 
     * @param {type} i_module "Module Name"
     * @param {type} i_controller "Controller Name"
     * @returns {Object} "Permit result {get , get_list , add , update , delete}"
     */
    getPermit = (i_module = null, i_controller = null , merchant_id = null) => {
        let _ret = {
            get: false,
            get_list: false,
            add: false,
            update: false,
            delete: false
        };
        return Object.keys(_ret).reduce((ret, _action) => {
            ret[_action] = this.checkRPermit(i_module, i_controller, _action) && (!!merchant_id && (['add','update','delete'].indexOf(_action) > -1) ? this.checkMerchant(merchant_id) : true);
            return ret;
        }, {});
    }

    /**
     * 
     * @returns {staffService@call;checkPermit}
     */
    getResourcePermit = (merchant_id = null) => {
        return this.getPermit('resource', 'main' , merchant_id );
    }

    /**
     * @param [String] group
     * @return boolean true/false
     */
    checkGPermit = (group) => {
        let _staff = this.$$user.staff();
        if (_staff !== null && Array.isArray(this.$$user.staff().role_group_list)) {
            return this.$$user.staff().role_group_list.filter((rg) => rg === ("STAFF_" + group)).length > 0;
        }
        return false;
    }

    /**
     * @param Object||String i_mix
     * @param [String] i_controller
     * @param [String] i_action
     * @return boolean true/false
     */
    checkRPermit = (i_mix = null, i_controller = null, i_action = null) => {
        let {module, ctrl, action} = i_mix
        , i_module = null;
        if (!!module && !!ctrl && !!action) {
            i_module = module;
            i_controller = ctrl;
            i_action = action;
        } else {
            i_module = i_mix;
        }
        let _staff = this.$$user.staff();
        if (_staff !== null && Array.isArray(this.$$user.staff().role_list)) {
            return this.$$user.staff().role_list.filter((role) => role.type === "STAFF" && role.module === i_module && role.ctrl === i_controller && role.action === i_action).length > 0;
        }
        return false;
    }

    /**
     * @param String merchant_id
     * @return boolean true/false
     */
    checkMerchant = (merchant_id = '') => {
        let _staff = this.$$user.staff();
        return  (!_staff || !merchant_id) ? false : _staff.merchant_uid.toString() === merchant_id.toString();
    }

}

const staff = new staffService();

export default staff;