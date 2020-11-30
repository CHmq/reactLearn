import {
  ROUTE_CONFIG,
  ROUTE_LIST,
  DEFAULT_LANG,
  DEFAULT_VO_LANG,
  globalRoute,
  defaultLocation
} from "components/routes/config";
import { RouteAdapter } from "components/routes/adapter";

function _getPath(pathURL, langURL, locationURL) {
  let $pathURL = pathURL || "";
  let $langURL = langURL || "";
  let $locationURL = locationURL || "";

  let $locationPath = !!$locationURL ? "/" + $locationURL : "";
  let $langPath = !!$langURL ? "/" + $langURL : "";
  return $locationPath + $langPath + $pathURL;
}

function _genRoute(_route, _lang) {
  _route["$location"] = defaultLocation;
  _route["$language"] = DEFAULT_LANG;
  _route["$voLanguage"] = DEFAULT_VO_LANG;
  _route["$rootURL"] = _getPath("/", DEFAULT_LANG.url, defaultLocation);
  _route["key"] = _route.key || _route.from;

  let $multiLang = Object.keys(ROUTE_CONFIG.SUPPORT_LOCALES).map(_location => {
    if (
      (!globalRoute && _location !== defaultLocation) ||
      (!!globalRoute && !ROUTE_CONFIG.SUPPORT_LOCALES[_location].global)
    ) {
      return null;
    }

    let _defaultLang = ROUTE_CONFIG.SUPPORT_LOCALES[_location].lang[0];
    let _defaultVOLang = ROUTE_CONFIG.SUPPORT_LOCALES[_location].vo_lang[0];

    let _global = ROUTE_CONFIG.SUPPORT_LOCALES[_location].global;

    let _langRoute = ROUTE_CONFIG.SUPPORT_LOCALES[_location].lang.map(_lang => {
      let isRedirect =
        _lang.value === _defaultLang.value ||
        _route.action === "redirect" ||
        false;
      /**
       * @description
       * Allow "/zh-hk/*" , "/en/*" to the target component with default locale config
       * Redirect "/zh-hk/*" to "/*" when "zh-hk" is default language and globalRoute = true
       */
      let __route = {
        ..._route,
        key: `${_route.key || _route.from}-${_location}-${_lang.value}-1`,
        path: _getPath(_route.path, _lang.url),
        action: !!globalRoute || isRedirect ? "redirect" : undefined,
        from: _getPath(_route.path || _route.from, _lang.url),
        to: _getPath(
          _route.path || _route.to,
          _lang.value === _defaultLang.value ? "" : _lang.url,
          !!globalRoute ? _location : ""
        ),
        $location: _location,
        $language: _lang,
        $voLanguage: _defaultVOLang,
        $rootURL: _getPath("/", _lang.url)
      };

      //        console.log(__route , isRedirect);
      return __route;
    });

    return [
      _langRoute,
      /**
       * @description
       * Allow "/hk/zh-hk/*" , "/hk/en/*" to the target component
       * Allow "/cn/zh-cn/*" to the target component
       * Redirect "/hk/zh-hk/*" to "/hk/*" when "HK" is providing global route and "zh-hk" is default language
       * Redirect "/cn/en/*" to "/en/*" when "CN" is not providing global route and "en" is not default language
       * Redirect "/cn/zh-cn/*" to "/*" when "CN" is not providing global route and "zh-cn" is default language
       */
      _langRoute.map(__route => {
        let isRedirect =
          __route.$language.value === _defaultLang.value ||
          _route.action === "redirect" ||
          false;
        let _ret = {
          ...__route,
          key: `${_route.key || _route.from}-${__route.$location}-${
            __route.$language.value
          }-2`,
          path: _getPath(_route.path, __route.$language.url, __route.$location),
          action: !globalRoute || !!isRedirect ? "redirect" : undefined,
          from: _getPath(
            _route.path || _route.from,
            __route.$language.url,
            __route.$location
          ),
          to: _getPath(
            _route.path || _route.to,
            !!isRedirect ? "" : __route.$language.url,
            !!globalRoute ? __route.$location : ""
          ),
          $rootURL: _getPath("/", __route.$language.url, __route.$location)
        };
        //        console.log(_ret , isRedirect);
        return _ret;
      }),
      {
        ..._route,
        key: (_route.key || _route.from) + "-" + _location,
        path: _getPath(_route.path, "", _location),
        action: !globalRoute ? "redirect" : undefined,
        $location: _location,
        $language: _defaultLang,
        $voLanguage: _defaultVOLang,
        $rootURL: _getPath("/", "", _location),
        from: _getPath(_route.path, "", _location),
        to: _getPath(_route.path)
      }
    ]
      .filter(_item => {
        return !!_item;
      })
      .flat();
  });
  _route["path"] = _getPath(_route.path, (_lang || { url: undefined }).url);

  /**
   * @description
   * Allow "/" to the target component
   * Redirect "/" to "/hk/*" when global route is activate
   */
  if (!!globalRoute) {
    _route["action"] = "redirect";
    _route["from"] = _route.path || _route.from;
    _route["to"] = _getPath(_route.path || _route.to, "", defaultLocation);
  }
  let ret = [...$multiLang, ...[_route]];

  //  console.log(ret);

  return ret
    .filter(_item => {
      return !!_item;
    })
    .flat();
}

let ROUTE_SETTINGS = ROUTE_LIST.map(_route => {
  return _genRoute(_route);
}).flat();

function _batchRoute(_route) {
  let ret = _route.map(_route => {
    return RouteAdapter({ ..._route });
  });
  return ret;
}
//console.log(ROUTE_SETTINGS);
export const defaultRoute = _batchRoute(ROUTE_SETTINGS);
export default {
  defaultRoute
};
