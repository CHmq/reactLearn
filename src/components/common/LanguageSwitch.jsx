/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component, Fragment } from "react";
import { Menu, Dropdown, Avatar, Switch, Icon, Tooltip } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";

import toast from "components/utils/toast";
import { SUPPORT_LOCALES } from "config/locale.json";

import IntlPolyfill from "intl";

import "assets/css/LanguageSwitch.module.scss";

global.Intl = IntlPolyfill;

const liStyle = { listStyle: "none", paddingLeft: 25 };

const locations = [...Object.keys(SUPPORT_LOCALES)];

class LanguageSwitch extends Component {
  $$lastLoad = {};
  $$langCache = {};

  /** state值 一览
   * languageList
   *    用户当前地区可用语言 array
   *
   * initDone
   *    translations 是否加載完畢 -- redux
   */
  state = {
    // userLocation: "",
    languageList: null,
    // currentLanguage: "",
    initDone: false
  };

  /** 初始化 redux translations 並 初始化多语言下拉菜单 */
  componentDidMount() {
    const {
      props: {
        updateTranslations,
        route: { currentLocation, currentLanguage },
        translations
      },
      state: { initDone }
    } = this;

    if (currentLocation)
      this.setState({
        languageList: SUPPORT_LOCALES[currentLocation].lang
      });

    updateTranslations(initDone);
    if (!!currentLanguage) return;

    try {
      this.httptranslations({
        currentLocale: "zh",
        fileName: translations.fileName || "home"
      });
    } catch (error) {
      console.log(error);
    }
  }

  /** react 生命週期 當 props 發生改變 以更新 多語言--Translations */
  componentDidUpdate(prevProps) {
    const { translations, route } = this.props;
    // const { translations: prevTranslations, route: prevRoute } = prevProps;
    const { route: prevRoute } = prevProps;

    const { currentLocation } = route;
    if (!currentLocation) return;
    // 初始化 当前地区 可选语言
    if (prevRoute !== route) {
      this.setState({
        languageList: SUPPORT_LOCALES[currentLocation].lang
      });
    }

    if (!!translations.fileName) {
      // 當舊 props 更新時 調用 驗證語言種類function
      if (
        this.checkFileLoaded(
          translations.fileName,
          route.currentLanguage.value,
          true
        )
      ) {
        this.httptranslations({
          fileName: translations.fileName,
          currentLocale: route.currentLanguage.value
        });
      }
    }
  }

  checkFileLoaded = (i_file = "", i_locale = "zh", i_retBoolean = false) => {
    let _fileList = Array.isArray(i_file) ? i_file : [i_file];
    if (!this.$$langCache[i_locale]) {
      this.$$langCache[i_locale] = {};
    }
    let ret = _fileList.filter(
      _file => !(Object.keys(this.$$langCache[i_locale]).indexOf(_file) > -1)
    );
    return !!i_retBoolean ? ret.length > 0 : ret;
  };

  isObject = item => {
    return item && typeof item === "object" && !Array.isArray(item);
  };

  mergeDeep = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.mergeDeep(target, ...sources);
  };

  /** 获取 多语言文本 异步请求
   * params
   *  currentLocale  當前選用的語言 string
   *
   *  fileName 需要在 `public/locales/${language}/${fileName}` 查找的對應文件名稱
   */
  httptranslations = async ({ currentLocale, fileName }) => {
    const { updateTranslations } = this.props;
    try {
      const data = [];

      this.checkFileLoaded(fileName, currentLocale).map(_file => {
        this.$$langCache[currentLocale][_file] = require(`locales/${currentLocale}/${_file}.json`);
        data.push(this.$$langCache[currentLocale][_file]);
        return null;
      });

      //        Object.keys(this.$$langCache[currentLocale]).map(_file => {
      //            data.push(this.$$langCache[currentLocale][_file]);
      //        });

      let _ret = data.reduce((_ret, cur) => {
        _ret = this.mergeDeep(_ret, cur);
        return _ret;
      }, this.$$lastLoad);

      this.$$lastLoad = _ret;

      console.log("Translations current locale data", _ret);
      // 调用 init 进行多语言渲染
      intl
        .init({
          currentLocale,
          locales: { [currentLocale]: _ret }
        })
        .then(() => {
          this.setState({ initDone: true }, () => {
            updateTranslations(this.state.initDone);
          });
        });
    } catch (error) {
      console.error(error);
      toast.createToast({
        type: "error",
        msg: "加載出現了錯誤,您可以稍後再試.",
        position: "top-right"
      });
    }
  };

  /** 点击切换语言 */
  handleClick = ({ item, key }) => {
    if(!item || !key) {
      return;
    }
    const {
      state: { languageList },
      props: { route }
    } = this;
    const { my_key } = item.props;
    const verification = key === route.currentLanguage.url;
    console.log("click ", my_key, key);
    switch (my_key) {
      case "languages":
        console.log(languageList, route);
        return verification
          ? toast.createToast({
              msg: "為您展示的已經是當前的語言啦"
            })
          : (window.location = `/${route.currentLocation}${
              verification ? "" : "/" + key
            }${
              route.realUrl ? route.realUrl : ""
              // languageList.filter(
              //   item => item.url === route.realUrl.replace(/\//gi, "")
              // )[0]
              //   ? ""
              //   : route.realUrl
            }`);
      case "locations":
        var goCountry = !!SUPPORT_LOCALES[key] ? SUPPORT_LOCALES[key] : SUPPORT_LOCALES['hk'];
        return window.location = goCountry.url;
      default:
        break;
    }
    return;
  };

  /** 创建多语言 语言选择 */
  createCurrentLocation = languageList => {
    const { translations } = this.props;
    return (
      <Menu.ItemGroup
        title={
          translations.initDone &&
          intl.get("home.publicMsg.header.languageList.locationLanguage")
        }
      >
        {languageList.map(item => (
          <Menu.Item key={item.url} style={liStyle} my_key="languages">
            {item.name}
          </Menu.Item>
        ))}
      </Menu.ItemGroup>
    );
  };
  // 跨境服務switch
  crossBorder = (bool) => {
    const {
      route: { currentLocation },
    } = this.props;
    
    window.location.href = bool ? `${process.env.REACT_APP_CBS_URL}/${currentLocation}` : process.env.REACT_APP_BASE_URL;
  }

  /** 创建菜单 */
  createMenu = () => {
    const {
      state: { languageList },
      props: { translations, route },
      handleClick,
      createCurrentLocation
    } = this;

    return (
      <Menu
        onClick={handleClick}
        defaultSelectedKeys={[
          route.currentLanguage
            ? route.currentLanguage.url
            : SUPPORT_LOCALES[process.env.REACT_APP_USER_LOCATION].lang.url,
          route.currentLocation || process.env.REACT_APP_USER_LOCATION
        ]}
        style={{ top: "5px" }}
      >
        {languageList && createCurrentLocation(languageList)}
        <Menu.Divider />
        {route.currentLocation !== 'cn' && (<Menu.ItemGroup
          title={
            translations.initDone &&
            intl.get("home.publicMsg.header.languageList.location")
          }
        >
          {locations.map(value =>  (
            <Menu.Item key={value} style={liStyle} my_key="locations">
              {translations.initDone &&
                intl.get(
                  `home.publicMsg.header.languageList.locations.${value}`
                )}
            </Menu.Item>
          ))}
        </Menu.ItemGroup>)}
        {process.env.REACT_APP_LOCATION === 'GLOBAL' && <Menu.Divider />}
        {process.env.REACT_APP_LOCATION === 'GLOBAL' && (
          <Menu.ItemGroup
            title={
              <Fragment>
                {translations.initDone && intl.get('general.msg.transborder_title')}
                <Tooltip 
                  title={<div dangerouslySetInnerHTML={{__html: translations.initDone && intl.get('general.msg.transborder_msg')}} />} placement='bottom'
                >
                  <Icon type="info-circle" style={{marginLeft: 5}} />
                </Tooltip>
              </Fragment>
            }
          >
            <div style={{textAlign: 'center'}}>
              <Switch 
                checkedChildren={<Icon type="check" />} 
                unCheckedChildren={<Icon type="close" />}
                defaultChecked={window.location.origin === process.env.REACT_APP_CBS_URL}
                onChange={this.crossBorder}
              />
            </div>
          </Menu.ItemGroup>
        )}
      </Menu>
    );
  };

  /** 渲染元素 下拉菜单 */
  render() {
    const {
      createMenu
    } = this;
    return (
      <Dropdown overlay={createMenu()} placement="bottomRight">
        <a className="ant-dropdown-link">
          <Avatar
            icon="global"
            size={48}
            style={{ backgroundColor: "transparent", color: "grey" , lineHeight: "40px" }}
          />
        </a>
      </Dropdown>
    );
  }
}

/** redux 獲得全局數據
 * route  route data (url, language)
 * user  user data (用戶數據)
 */
function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations
  };
}

/** redux 數據更新
 * initLanguageState  初始化 language  bool
 * updateTranslations 更新language 以渲染多语言
 */
function mapDispatchToProps(dispatch) {
  return {
    updateTranslations: payload =>
      dispatch({ type: "updateTranslations", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LanguageSwitch);
