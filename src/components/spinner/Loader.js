import React, { Component } from 'react';
import { connect } from "react-redux";
import cssEVILoader from 'assets/css/spinner/EVILoader.module.scss';

class EVILoader extends Component {

    render() {
        const { loading : _render } = this.props;
        
        return (_render === false ? null : (<div className={cssEVILoader.container} style={this.props.style}>
            <img className={`${cssEVILoader.loaderWrapper} ${cssEVILoader.loader1} ${cssEVILoader.loaderImg}`} src={require(`assets/image/spinner/spinner1.png`)} alt="Loading-Spinner"/>
            <img className={`${cssEVILoader.loaderWrapper} ${cssEVILoader.loader2} ${cssEVILoader.loaderImg}`} src={require(`assets/image/spinner/spinner2.png`)} alt="Loading-Spinner"/>
            <img className={`${cssEVILoader.loaderWrapper} ${cssEVILoader.loader3} ${cssEVILoader.loaderImg}`} src={require(`assets/image/spinner/spinner3.png`)} alt="Loading-Spinner"/>
            <img className={`${cssEVILoader.loaderWrapper} ${cssEVILoader.loader4} ${cssEVILoader.loaderImg}`} src={require(`assets/image/spinner/spinner4.png`)} alt="Loading-Spinner"/>
        </div>));
    }
}


function mapStateToProps( { route, user, translations }) {
    return {
        route,
        user,
        translations
    };
}


export default connect(mapStateToProps)(EVILoader);
