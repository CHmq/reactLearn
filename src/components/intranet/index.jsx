import React, { Component } from "react";
import { Icon, Spin } from "antd";

// import intl from "react-intl-universal";
import { connect } from "react-redux";

import user from "components/services/userService";
// import staff from "components/services/staffService";

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class Intranet extends Component {
    $$isMount = false;

    constructor(props) {
        super(props);
        this.intranetForm = React.createRef();
        this.state = {
            intranet: null
        };
    }

    async componentDidMount() {
        this.$$isMount = true;

        // const {params: {ref_id}} = this.props.match;        
        
        if (!!this.$$isMount && !this.state.intranet) {
            this.goIntranet();
        }
    }
    
    async componentDidUpdate() {
        const form = this.intranetForm.current;
        form.submit();
    }

    goIntranet = () => {
        const { route } = this.props;
        user.goIntranet(route.realUrl).then(intranet => {
            if(!!this.$$isMount) {
                this.setState({intranet}, () => {
                    console.log(this.state.intranet);
                });
            }
        });
    }
    
    handleSubmit = (e) => {
        console.log(e);
        const { intranet } = this.state;
        if(!intranet.parms) {
            return;
        }
   }

    componentWillUnmount = async () => {
        this.$$isMount = false;
    }

    render() {
        const {intranet} = this.state;
        return (<div className={"d-flex"} style={{height: "calc(100vh - 80px - 70px)", alignItems: "center", justifyContent: "center"}}>
            {!intranet && (<Spin tip="Loading..." indicator={(<Icon type="loading" style={{fontSize: 24}} spin />)} />)}
            {!!intranet && (<form action={intranet.url} method="post" ref={this.intranetForm} onSubmit={this.formCheck}>
                {Object.keys(intranet.parms || {}).map(_key => {
                    return (<input key={`intranet-${_key}`} type="hidden" name={_key} value={intranet.parms[_key]} />);
                })}
            </form>)}
            {!!intranet && (<h3>正在前往內聯網…</h3>)}
        </div>);
    }
}

/** redux 獲得全局數據
 * route  route data (url, language)
 * user  user data (用戶數據)
 */
function mapStateToProps( { route, user, translations }) {
    return {
        route,
        user,
        translations
    };
}

export default connect(mapStateToProps)(Intranet);
