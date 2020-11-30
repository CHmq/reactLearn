import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isAuth } from "components/services/authService";
import EVIFrame from "components/core/Frame";
import NotFound from "components/layout/404";

export default function ProtectedRoute(props) {
  const {
    EVIComponent: Component,
    preLogin: preComponent,
    render,
    noFrame,
    preLoginNoFrame,
    auth,
    location: { pathname },
    ...rest
  } = props;

  console.log(props);

  const { $rootURL } = { ...rest };

  /** 用户是否登录 */
  const _auth = auth === true ? isAuth() : true;

  /** 是否存在组件,如果不存在一律跳转404 */
  const flag = preComponent || Component;

  const ProtectedRoute = !_auth ? (!!preComponent ? Route : Redirect) : Route;
  const newNoFrame =
    typeof noFrame == undefined ? true : !_auth ? true : noFrame;

  if (!flag) {
    return (
      <Redirect
        {...rest}
        from={pathname}
        to={`${$rootURL}404`}
        render={props => {
          return (
            <EVIFrame
              nonAuthElement={NotFound}
              authElement={NotFound}
              noFrame={!_auth ? preLoginNoFrame : newNoFrame}
              isAuth={auth}
              {...props}
              {...rest}
            />
          );
        }}
      />
    );
  }

  return (
    <ProtectedRoute
      {...rest}
      to={!_auth ? $rootURL : "/"}
      render={props => {
        return (
          <EVIFrame
            nonAuthElement={preComponent}
            authElement={Component}
            noFrame={!_auth ? preLoginNoFrame : newNoFrame}
            isAuth={auth}
            {...props}
            {...rest}
          />
        );
      }}
    />
  );
}
