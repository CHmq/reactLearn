/*
 * @使用方法:创建组件<Banner img={'图片路径'} height={'默认为400px'} heightauto={默认为false }> 
 */

import React, { Component } from 'react';
import { Row } from 'antd';

import style from 'assets/css/Banner.module.scss';

/**
 * 
 * @type Component
 */
class Banner extends Component {
    // 设置默认值 
    static defaultProps = {
        height: '55vh',
        index: '',
        heightauto: false // 高度为自适应 当max-width: 991px时候使用的类名
    }
    
    render() {
        const {img, height, heightauto, className, children, style: _style, index , ...rest } = this.props;
        const styleCss = {
            main: {
                minHeight: height,
                backgroundImage: !!img ? `url(${img})` : "none"
            }
        };        
        const _class = `${style.BannerWarp} ${!height || heightauto ? `${style.auto}` : ''} ${className}`;        
        return (<Row style={{..._style , ...styleCss.main}} className={_class} {...rest}>{children}</Row>);
    }
};

export default Banner;