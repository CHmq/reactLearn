//PAGE
import Home from "components/Home";
import Landing from "components/Landing";
import NotFound from "components/layout/404";

//LOGIN_FLOW
import Verify from "components/Verify";
import History from "components/History";
import MyFavorite from "components/MyFavorite";
import Article from "components/Article";

//USER PAGE
import Achievement from "components/Achievement";
import Intranet from "components/intranet";

//RESOURCE PAGE
import ResourceCheck from "components/resource/Checking";

//COURSE PAGE
import CourseAdapter from "components/course/CourseAdapter";
import Info from "components/Info";

import AchievementsSchool from "components/AchievementsSchool";
import AchievementsDetail from "components/AchievementsDetail";
import AchievementsBasic from "components/AchievementsBasic";
import ArticleInfo from "components/ArticleInfo";

import Ranking from "components/Ranking";

// 关于我们等 4个页面
import OtherPages from "components/common/contact";

import PHome from "components/common/parentVer/pHome";

import locale from "config/locale";

let _auth = [
  {
    path: "/",
    key: "Home",
    tag: "student",
    component: Home,
    preLogin: Landing,
    exact: true
  },
  {
    path: "/intranet",
    key: "intranet",
    tag: "student",
    component: Intranet,
    exact: true
  },
  {
    path: "/fishgame",
    key: "fishgame",
    tag: "student",
    component: Intranet,
    exact: true
  },
  {
    path: "/parent",
    key: "parent",
    tag: "parent",
    component: PHome,
    preLogin: PHome,
    exact: true
  },
  {
    path: "/parent/article",
    key: "Article",
    tag: "parent",
    component: Article,
    preLogin: Article,
    exact: true
  },
  {
    path: "/parent/article/:article_id",
    key: "ArticleInfo",
    tag: "parent",
    component: ArticleInfo,
    preLogin: ArticleInfo,
    exact: true
  },
  {
    path: "/about_us",
    key: "about_us",
    tag: "about_us",
    preLogin: Landing,
    component: OtherPages,
    exact: true
  },
  {
    path: "/contact_us",
    key: "contact_us",
    tag: "contact_us",
    preLogin: Landing,
    component: OtherPages,
    exact: true
  },
  {
    path: "/privacy",
    key: "privacy",
    tag: "privacy",
    preLogin: Landing,
    component: OtherPages,
    exact: true
  },
  {
    path: "/disclaimer",
    key: "disclaimer",
    tag: "disclaimer",
    preLogin: Landing,
    component: OtherPages,
    exact: true
  },
  {
    path: "/resource/:ref_id",
    key: "Resource",
    tag: "student",
    component: ResourceCheck,
    exact: true
  },
  {
    path: "/course/:course_id",
    key: "Course",
    tag: "student",
    component: CourseAdapter,
    exact: true
  },
  // {
  //   path: "/schoolCourse/:course_id",
  //   key: "SchoolCourse",
  //   tag: "student",
  //   component: SchoolCourse,
  //   exact: true
  // },
  {
    path: "/course/info/:course_id",
    key: "CourseInfo",
    tag: "student",
    component: Info,
    exact: true
  },
  {
    path: "/achievements",
    key: "Achievement",
    tag: "student",
    component: Achievement,
    exact: true
  },
  {
    path: "/verify",
    key: "Verify",
    tag: "Verify",
    component: Verify,
    exact: true
  },
  {
    path: "/ranking",
    key: "Ranking",
    tag: "Ranking",
    component: Ranking,
    exact: true
  },
  {
    path: "/history",
    key: "History",
    tag: "student",
    component: History,
    exact: true
  },
  {
    path: "/favorite",
    key: "Favorite",
    tag: "student",
    component: MyFavorite
  },
  {
    path: "/achievements/report/school",
    key: "AchievementsSchool",
    tag: "student",
    component: AchievementsSchool,
    exact: true
  },
  {
    path: "/achievements/report/detail/:course_id",
    key: "AchievementsDetail",
    tag: "student",
    component: AchievementsDetail,
    exact: true
  },
  {
    path: "/achievements/report/:course_id",
    key: "AchievementsBasic",
    component: AchievementsBasic,
    tag: "student",
    exact: true
  }
];

let _normal = [
  {
    path: "/register/:family_token?",
    key: "Register",
    tag: "Register",
    component: Landing
  },
  {
    path: "/404",
    key: "404",
    tag: "404",
    component: NotFound,
    exact: true
  },
  {
    from: "/student",
    to: "/",
    action: "redirect"
  },
  {
    from: "*",
    to: "/404",
    action: "redirect"
  },
  {
    from: "/:error",
    to: "/error",
    action: "redirect"
  }
];

const data = {
  location: undefined,
  lang: undefined,
  vo_lang: undefined
};

/**
 * @param {const} globalRoute
 * true : "GLOBAL" , can cross region login
 * false : "STANDALONE" , can only access current region
 */
export const globalRoute = eval(process.env.REACT_APP_GLOBAL_ROUTE);
export const defaultLocation = process.env.REACT_APP_USER_LOCATION;

export const DEFAULT_LANG =
  data.lang || locale.SUPPORT_LOCALES[defaultLocation].lang[0];
export const DEFAULT_VO_LANG =
  data.vo_lang || locale.SUPPORT_LOCALES[defaultLocation].vo_lang[0];
export const ROUTE_CONFIG = locale;
export const ROUTE_LIST = [
  ..._auth.map(_route => {
    _route["auth"] = true;
    return _route;
  }),
  ..._normal.map(_route => {
    _route["auth"] = false;
    return _route;
  })
];
