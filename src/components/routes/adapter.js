import React from "react";
import { Redirect } from "react-router-dom";
import ProtectedRoute from "components/routes/ProtectedRoute.jsx";

const components = {
  redirect: Redirect,
  auth: ProtectedRoute,
  default: ProtectedRoute
};

export function RouteAdapter(props) {
  const {
    path,
    action,
    key,
    component: Component,
    exact,
    from,
    to,
    auth,
    noFrame,
    ...rest
  } = props;

  let RouteAdapter =
    components[action || (auth === true ? "auth" : false) || "default"];

  return (
    <RouteAdapter
      {...rest}
      auth={auth}
      key={key}
      exact={exact}
      render={props => {
        return <Component {...props} {...rest} />;
      }}
      EVIComponent={Component}
      from={from}
      to={to}
      path={path}
      locationUrl={{ ...rest }.$rootURL}
      noFrame={noFrame}
    />
  );
}
