import http from "axios";

class AliLogTracker {

    uri_ = null;

    constructor(host, project, logstore) {
        this.uri_ = 'https://' + project + '.' + host + '/logstores/' + logstore + '/track?APIVersion=0.6.0';
    }

    logger = (param) => {
        let url = this.uri_;
        try
        {
            return http.request({
                url : url,
                method : 'get',
                params : param
            });
        } catch (ex)
        {
            if (window && window.console && typeof window.console.log === 'function')
            {
                console.log("Failed to log to ali log service because of this exception:\n" + ex);
                console.log("Failed log data:", url);
            }
            return false;
        }
    }
}

export default AliLogTracker;
