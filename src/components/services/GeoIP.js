import http from "axios";

class GeoIP {

    uri_ = null;
    key_ = "";

    constructor(_key) {
        this.key_ = _key;
        this.uri_ = `https://pro.ip-api.com/json`;
    }

    info = () => {
        let url = this.uri_;
        try
        {
            return http.request({
                url : url,
                method : 'get',
                params : {
                    key : this.key_
                }
            });
        } catch (ex)
        {
            if (window && window.console && typeof window.console.log === 'function')
            {
                console.log("Failed to get geo ip because of this exception:\n" + ex);
                console.log("Failed get geo info:", url);
            }
            return false;
        }
    }
}

export default GeoIP;
