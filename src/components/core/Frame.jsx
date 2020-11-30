import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Layout, Button, notification } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import MyHeader from "components/layout/Header";
import MyFooter from "components/layout/Footer";

import EVILoader from "components/spinner/Loader";

import auth from "components/services/authService";
import user from "components/services/userService";
import log from "components/services/logService";
import course from "components/services/courseService";

import { SUPPORT_LOCALES } from "config/locale";

import { toast } from "react-toastify";

import GeoIP from "components/services/GeoIP";

const geoIP = new GeoIP(process.env.REACT_APP_IPAPI_KEY || "4v0m70l2OiLfp5P");

const { Content } = Layout;

class EVIFrame extends Component {
  pv = null;
  pvTime = 0;
  startTime = 0;
  initRoute = false;
  startMount = false;

  constructor(props) {
    super(props);
    this.state = {
      $route: this.getRoute(),
      initFrame: false,
      redirect: null,
      isHealth: true,
      emptyHeight: 76
    };
  }

  setEmptyHeight = (height) => {
    this.setState({
      emptyHeight: height
    })
  }

  getRoute = () => {
    let {
      $language: currentLanguage,
      $location: currentLocation,
      $voLanguage: currentVoLanguage,
      $rootURL: locationUrl,
      match,
      tag,
      history
    } = this.props;

    let supportLocale = SUPPORT_LOCALES[currentLocation] || {
      lang: [],
      vo_lang: []
    };

    let route = {
      currentLanguage,
      currentLocation,
      currentVoLanguage,
      locationUrl,
      tag: tag,
      realUrl: match.url
        .replace(locationUrl.slice(0, -1), "")
        .replace("/" + currentLocation, ""),
      history,
      supportLocale
    };

    user.setLang(this.props.$language.value);
    return route;
  };

  init() {
    let {
      initRoute,
      initUser,
      setMerchant,
      $rootURL: locationUrl
    } = this.props;

    let _route = this.getRoute();
    this.initRoute = !!initRoute(_route);

    user
      .me()
      .then($user => {
        let _currentRegion = _route.currentLocation;
        let userRegion = $user.region.toLowerCase();
        if (_currentRegion !== userRegion) {
          window.location = `${SUPPORT_LOCALES[userRegion].url}${_route.realUrl}`;
        }
        if (
          ["parent", "student"].indexOf(_route.tag) > -1 &&
          ["parent", "student"].indexOf(user.getType().toLowerCase()) > -1 &&
          user.getType().toLowerCase() !== _route.tag
        ) {
          console.log(this.state.redirect);
          this.setState(
            {
              redirect: `/${_currentRegion}/${user.getType().toLowerCase()}`
            },
            () => console.log("newreDirect", this.state.redirect)
          );
        }
        initUser($user);
        if (!!user && !!user.isStaff() && !user.getMID()) {
          let merchantID = user.staff().merchant_id;
          setMerchant(merchantID);
          user.setMID(merchantID);
        }
      })
      .then(() => {
        log.PV(this.state.$route);
      })
      .catch(({ result, msg }) => {
        setMerchant("");
        initUser(null);
        if (!!msg && !!user.getUToken()) {
          toast.error(msg, {
            autoClose: 2000,
            position: toast.POSITION.TOP_CENTER,
            onClose: () => {
              window.location = locationUrl;
            }
          });
        }
      })
      .then(() => {
        if (!!this.$$mount) {
          this.setState({ initFrame: true });
        }
      });
  }

  async componentDidMount() {
    this.startMount = true;
    this.$$mount = true;
    this.init();
    this.props.updateFileName("home");

    this.startTime = new Date().getTime() / 1000;
    window.addEventListener("beforeunload", this.logPageStay);
    this.startMount = false;

    geoIP.info().then(
      _ip => {
        let _location = _ip.data.countryCode.toLowerCase();
        let _found = Object.keys(SUPPORT_LOCALES).indexOf(_location) > -1;
        if (!!_found) {
          console.log("Country found");
        } else {
          console.log(`${_ip.data.countryCode.toLowerCase()} not in services`);
        }

        if (
          !!_found &&
          this.props.$location !== _location &&
          !this.state.notification
        ) {
          let _key = `notificationReminder`;
          notification.config({
            placement: "bottomRight"
          });
          notification.open({
            message:
              (this.props.translations.initDone &&
                intl.get("home.publicMsg.LocationNotice.title")) ||
              "切換地區",
            description:
              (this.props.translations.initDone &&
                `${intl.get("home.publicMsg.LocationNotice.content", {
                  _location: intl.get(
                    "home.publicMsg.header.languageList.locations." + _location
                  )
                })}`) ||
              `${_location}地區已經推出，立即切換觀看適用於你所在位置的內容。`,
            btn: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  notification.close(_key);
                  window.location.href = SUPPORT_LOCALES[_location].url;
                }}
              >
                {(this.props.translations.initDone &&
                  intl.get("home.publicMsg.LocationNotice.confirm")) ||
                  "立即切換"}
              </Button>
            ),
            key: _key,
            onClose: () => {}
          });
          this.setState({ notification: true });
        }
      },
      _err => {
        console.log("Cannot get ip info from user");
      }
    );

    course.healthCheck().then(ret => {
      this.setState({ isHealth: ret !== 'BUSY' });
    }).catch(() => {
      this.setState({ isHealth: false });
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      !!this.props.user.display_id &&
      prevProps.user.display_id !== this.props.user.display_id &&
      !this.startMount
    ) {
      this.setState({ initFrame: false }, () => {
        this.init();
      });
    }
  }

  componentWillUnmount() {
    this.$$mount = false;
    log.stay(this.props.route, new Date().getTime() / 1000 - this.startTime);
    window.removeEventListener("beforeunload", this.logPageStay);
  }

  logPageStay = e => {
    log.exit(this.props.route, new Date().getTime() / 1000 - this.startTime);
  };

  handleClose = () => {
    this.setState({ show: "none" });
    sessionStorage.setItem("eviDownload", "none");
  };

  render() {
    const { locationUrl, $language, noFrame, $location, isAuth } = this.props;
    const _loading =
      !user.isInit() || !!user.isLoading() || !this.state.initFrame;
    const EVIElement =
      isAuth === true
        ? auth.isAuth()
          ? this.props.authElement
          : this.props.nonAuthElement
        : this.props.authElement;

    return this.state.redirect !== null ? (
      <Redirect to={this.state.redirect} />
    ) : (
      <Layout style={{ backgroundColor: "#fff", minHeight: "100%" }}>
        {noFrame !== true && this.initRoute && (
          <MyHeader 
            $location={$location}
            locationUrl={locationUrl}
            languageUrl={$language.url}
            isHealth={this.state.isHealth}
            setEmptyHeight={this.setEmptyHeight}
            setHealth={() => {
              this.setState({
                isHealth: true
              })
            }}
          />
        )}
        <Content
          style={{
            flex: 1,
            paddingTop: noFrame !== true ? this.state.emptyHeight : "0",
            flexDirection: "column",
            ...(!!_loading
              ? {
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex"
                }
              : {})
          }}
        >
          {!!_loading ? (
            <div className={"d-flex"}>
              <EVILoader />
            </div>
          ) : (
            <EVIElement {...this.props} />
          )}
        </Content>
        {noFrame !== true && this.initRoute && (
          <MyFooter locationUrl={locationUrl} languageUrl={$language.url} />
        )}
      </Layout>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { route, user, translations, merchant } = state;
  return { route, user, translations, merchant };
}

function mapDispatchToProps(dispatch) {
  return {
    initRoute: payload => dispatch({ type: "initRoute", payload }),
    initUser: payload => dispatch({ type: "INIT", payload }),
    setMerchant: payload => dispatch({ type: "setMerchant", payload }),
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EVIFrame);
