import React, { Component } from 'react';
import { Modal, Checkbox, Button, Icon, List } from 'antd';
import { connect } from "react-redux";
import intl from "react-intl-universal";

import course from "components/services/courseService";
import user_API from "components/services/userService";
import NewPage from "components/services/user_commentService";
import main from "components/services/mainService";

import NewsEdit from "components/common/NewsEdit";
import Popup from "components/common/Popup";
import PopupSpecial from "components/PopupSpecial";

function setLocalStorage(key, value){
    var curTime = new Date().getTime();
    localStorage.setItem(key, JSON.stringify({ data: value, time: curTime }));
}

function getLocalStorage(key, exp){
    if(localStorage.getItem(key)) {
        var data = localStorage.getItem(key);
        var dataObj = JSON.parse(data);
        if (new Date().getTime() - dataObj.time > exp) {
            localStorage.removeItem(key);
            return true;
        }else{
            var dataObjDatatoJson = JSON.parse(dataObj.data)
            return dataObjDatatoJson;
        }
    } else {
        return true;
    }
}

class NewsMdaol extends Component {
    state = {
        visible: false,
        courseVisible: false,
        expire: true,
        show: getLocalStorage(this.props.page, 1000*60*60*24),
        data: [],
        courseData: []
    }

    componentDidMount() {
        this.getData();
    }

    lang = value => {
        return this.props.translations.initDone && intl.get(value);
    }

    getData = async () => {
        const { page, route: { currentLocation } } = this.props;
        await course.getNewsList().then(ret => {
            const data = ret.rows.filter(item => item.page.includes(page) && item.is_show === 'Y' && item.region.toLowerCase() === currentLocation);
            this.setState({ data, visible: !!data.length });
        }).catch(error => {
            console.log(error);
        })
    }

    onClose = () => {
        this.setState({visible: false, show: false})
        if(this.state.expire) setLocalStorage(this.props.page, false);
    }

    onChange = e => {
        this.setState({expire: e.target.checked});
    }

    action = value => {
        const { locationUrl } = this.props.route;
        window.open(`${locationUrl}course/${value}`);
    }

    setCourseVisible = async (id, course_id, type) => {
        if(type == 'project' && !!id && !!course_id){
            this.setState({
                fileData: await NewPage.VerifyUplaod(id, course_id).then(ret => {
                    this.setState({comment: ret.comment});
                    return {
                        id: ret.id,
                        title: ret.res_name,
                        refId: id,
                        fileList: [{
                            uid: ret.id,
                            status: "done",
                            url: ret.file
                        }]
                    }
                }).catch(() => {return { refId: id }}),
                courseVisible: true,
                courseID: course_id,
                courseData: await main.getFullInfo(id).then(ret => {
                    console.log(ret);
                    return ret;
                })
                .catch(_msg => {
                    console.log(_msg);
                    return [];
                })
            })
            this.child._init();
        }
    }

    onOpend = ref => {
        this.child = ref;
    };

    render() {
        const { visible, data, show } = this.state;
        const { user } = this.props;
        const is_edit = user_API.getType() === "STAFF" && user_API.staff().merchant_uid === '1';
        return(
            <Modal visible={visible && show} onCancel={this.onClose} footer={null} bodyStyle={{padding: '56px 24px'}} centered zIndex={777}>
                <List
                dataSource={data}
                renderItem={item => (
                    <List.Item>
                        <div style={{position: 'relative', width: '100%'}}>
                            <h2>{item.title}</h2>
                            {!!item.iframe_url ? (
                                <iframe frameBorder="0" src={item.iframe_url} style={{width: '100%', height: 500}}></iframe>
                            ) : (
                                <div dangerouslySetInnerHTML={{__html: item.content}} />
                            )}
                            {is_edit && (
                                <NewsEdit id={item.id} callBack={() => this.getData()}>
                                    <div style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer'}}>
                                        <Icon style={{fontSize: 24}} type='edit' />
                                    </div>
                                </NewsEdit>
                            )}
                            {!!item.course_display_id && !!user.id && (
                                <Button
                                type='primary' 
                                onClick={() => this.action(item.course_display_id)} 
                                style={{margin: '10px 5px 10px 0'}}>
                                    進入活動課程
                                </Button>
                            )}
                            {!!item.res_id && !!user.id && (
                                <Button 
                                type='primary' 
                                onClick={() => this.setCourseVisible(item.res_id, item.course_id, item.res_type)} 
                                style={{margin: "10px 0 10px 5px"}}>
                                   參加活動
                                </Button>
                            )}
                        </div>
                    </List.Item>
                )}/>
                {is_edit && (
                    <NewsEdit callBack={() => this.getData()}>
                        <div style={{marginBottom: 20, textAlign: 'center'}}>
                            <Button type='primary'>
                                <Icon type='plus' />
                                {this.lang("general.button.add")}
                            </Button>
                        </div>
                    </NewsEdit>
                )}
                <Checkbox checked={this.state.expire} onChange={this.onChange}>
                    {this.lang(`general.msg.news_msg`)}
                </Checkbox>
                <Popup 
                visible={this.state.courseVisible} 
                zIndex={888} 
                style={{backgroundColor : "white" , padding : 0}}>
                    <PopupSpecial
                        onOpend={this.onOpend}
                        onCancel={() => this.setState({courseVisible: false})}
                        data={this.state.courseData}
                        fileData={this.state.fileData}
                        urlId={this.state.courseID}
                        comment={this.state.comment || []}
                    />
                </Popup>
            </Modal>
        )
    }
}

function mapStateToProps({ route, translations, user }) {
    return {
        route,
        user,
        translations
    };
}

export default connect(mapStateToProps)(NewsMdaol);