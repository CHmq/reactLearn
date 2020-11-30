import React, { Component } from "react";
// import Animate from 'rc-animate';
import {Icon, Spin  } from "antd";
import intl from "react-intl-universal";
import { connect } from "react-redux";
// import { Textfit } from "react-textfit";

// import ResourceSelectType from "components/resource/SelectType";
import Adapter from "components/resource/Adapter";

import resource from "components/services/mainService";
import staff from "components/services/staffService";

// import QueueAnim from 'rc-queue-anim';

// import styles from "assets/css/home.module.scss";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Checking extends Component {
  $$isMount = false;

  constructor(props) {
    super(props);
    this.state = {
      resource : null,
      $$loading: false,
      staffPermit: false
    };
  }

  async componentDidMount() {
    this.$$isMount = true;
    
    const { params : { ref_id } }  = this.props.match;
    
    this.props.updateFileName("home");
    
    if(this.props.user.type === "STUDENT") {
//        this.getMenu();
    }

    if (!!this.$$isMount) {
        this.setState({
          staffPermit: staff.checkRPermit({
            module: "resource",
            ctrl: "main",
            action: "get"
          })
        } , () => {
            if(!!this.state.staffPermit || this.props.user.type === "STUDENT") {
                /*console.log("get_permit" , ref_id);*/
                this.getResource(ref_id);
            }
        });
    }
  }
  
  getResource = (i_refID) => {
      resource.get(i_refID).then(_res => {
          this.setState({resource : _res} , () => {
              console.log(this.state.resource);
          });
      });
  }

  componentWillUnmount = async () => {
    this.$$isMount = false;
  }
  
  render() {
      
      const { resource } = this.state;
      const { translations } = this.props;
    return (<div className={"d-flex"} style={{height: "calc(100vh - 80px - 70px)", alignItems: "center", justifyContent: "center"}}>
        {!resource && (<Spin tip="Loading..." indicator={(<Icon type="loading" style={{ fontSize: 24 }} spin />)} />)}
        {!!resource && (<div><Adapter res_type={resource.type} ref_id={resource.id} item={resource} autoRun={true} >{translations.initDone && intl.get(`general.loading`)} </Adapter></div>)}
    </div>);
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

export default connect(mapStateToProps)(Checking);
