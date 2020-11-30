import React, { Component } from "react";
import { Switch } from "react-router-dom";
import { ToastContainer , toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import EVIRoute from "components/routes/router";


toast.configure({
    autoClose: 2000,
    position: toast.POSITION.TOP_CENTER,
    toastId: "EVI_TOAST"
});

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <ToastContainer style={{zIndex:100000000}}/>
        <Switch>
        {EVIRoute.defaultRoute}
        </Switch>
      </React.Fragment>
    );
  }
}

export default App;