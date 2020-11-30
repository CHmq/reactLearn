import user from "components/services/userService";
import AliLogTracker from "components/services/AliLogTracker";

// 

const tracker = new AliLogTracker("cn-hongkong.log.aliyuncs.com", "kid-tracking", "web-tracking");

class logService {

    $user = user;

    tracker = tracker;

    getUser = this.$user.getUser;

    $getMeta = async(_route, type = "") => {
        let {tag, realUrl, currentLocation: location, currentLanguage: {value: language}} = _route;
        let {id, display_id, device_id} = await this.getUser();

        return {...{
                    id,
                    display_id,
                    device_id,
                    merchant_id: this.$user.getMID(),
                    timestamp: (new Date().getTime()) / 1000,
                    page: realUrl,
                    tag,
                    location,
                    language,
                    type: type
            }};
    }

    $$call = async(i_config) => {
        try {
            let {route, duration, type} = i_config;
            let meta = await this.$getMeta(route, type);
            return tracker.logger({...meta, duration}).then(ret => {
                return ret;
            }).catch(_err => {
                throw _err;
            });
        } catch (_err) {
            return null;
        }
    }

    PV = async(_route) => {
        return this.$$call({
            route: _route,
            type: "page_view"
        });
    }

    stay = async(_route, duration) => {
        return this.$$call({
            route: _route,
            duration: duration,
            type: "page_stay"
        });
    }

    exit = async(_route, duration) => {
        return this.$$call({
            route: _route,
            duration: duration,
            type: "page_exit"
        });
    }

}

const log = new logService();

export default log