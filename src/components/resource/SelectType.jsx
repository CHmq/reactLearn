import React, { Component } from "react";
import { Checkbox, Tag } from "antd";
import { connect } from "react-redux";
import intl from "react-intl-universal";
import { RESOURCE , IMAGE_CATEGORY , TEACH_GUIDE_CATEGORY , TEACH_GUIDE_THEME, EVI_COURSE_TAG } from "config/course.json";
import school from 'components/services/school';
class selectType extends Component {

    _fn = function(value) {
        return this.props.translations.initDone && intl.get("general.select."+value);
    }

    $$defaultOpt = [
        {label: this._fn("resource"), value: RESOURCE[0], is_select: false},
        {label: this._fn("picture"), value: "img_real,img_cartoon,img_line_graph", is_select: false},
        {label: this._fn("teach_guide"), value: "teach_guide", is_select: false},
        {label: this._fn("worksheet"), value: "worksheet", is_select: false},
        {label: this._fn("project"), value: "project", is_select: false},
        {label: this._fn("video"), value: "video", is_select: false},
        {label: this._fn("audio"), value: "audio", is_select: false},
        {label: this._fn("document"), value: "document", is_select: false}
    ];
    
    $$eviCourseOpt = [
        {label: this._fn("resource"), value: RESOURCE[0], is_select: false},
        {label: this._fn("picture"), value: "img_real,img_cartoon,img_line_graph", is_select: false},
        {label: this._fn("teach_guide"), value: "teach_guide", is_select: false},
        {label: this._fn("jttw360"), value: "jttw360", is_select: false},
    ];

    $$schoolCourseOpt = [
        {label: this._fn("mix"), value: "mix", is_select: false},
        {label: this._fn("worksheet"), value: "worksheet", is_select: false},
        {label: this._fn("project"), value: "project", is_select: false},
        {label: this._fn("video"), value: "video", is_select: false},
        {label: this._fn("audio"), value: "audio", is_select: false},
        {label: this._fn("document"), value: "document", is_select: false}
    ]
    
    $$imageCat = IMAGE_CATEGORY;
    $$teachGuideCat = TEACH_GUIDE_CATEGORY;
    $$teachGuideTheme = TEACH_GUIDE_THEME;
    $$eviCourseTag = EVI_COURSE_TAG;

    constructor(props) {
        super(props);
        this.state = {
            ignore : this.props.defaultIgnore || ["img_real","img_cartoon","img_line_graph"],
            selected : this.props.default || RESOURCE,
            tag : this.props.defaultTag || [],
            keyword : this.props.defaultKeyword || [],
            schoolKeyWord: []
        };
    }

    componentDidMount() {
        school.getTagCount().then(ret => {
            this.setState({ schoolKeyWord: ret });
        })
    }

    callback = (ret = [] ,tag = [], keyword = "") => {
        let itemList = [].concat(...(ret.map(_item => {
            return (_item.split(",")).filter(__item => !(["img_real","img_cartoon","img_line_graph"].indexOf(__item) > -1) || this.state.ignore.indexOf(__item) > -1);
        })));
        this.setState({selected : ret , tag : tag , keyword : keyword});
        return typeof this.props.callback === "function" ? this.props.callback(itemList , keyword || tag , "") : itemList;
    }
    
    tagCallback = (tag , checked) => {
        let _idx = this.state.tag.indexOf(tag.value || tag.name);
        let _select = this.state.tag;
        (_idx > -1 ? _select.splice(_idx , 1) : _select.push(tag.value || tag.name));
        this.callback(this.state.selected , _select);
        //this.callback(this.state.selected , tag.value);
    }
    
    ignoreCallback = (ignore , checked) => {
        let _idx = this.state.ignore.indexOf(ignore);
        let _ignore = this.state.ignore;
        (_idx > -1 ? _ignore.splice(_idx , 1) : _ignore.push(ignore));
        this.setState( { ignore : _ignore } , () => this.callback(this.state.selected , this.state.tag , this.state.keyword));
    }
        
    keywordCallback = (_keyword , checked) => {
        this.callback(this.state.selected , this.state.tag , _keyword.value);
    }
    
    typeCallback = (type , checked) => {
        let _idx = this.state.selected.indexOf(type.value);
        let _select = this.state.selected;
        (_idx > -1 ? _select.splice(_idx , 1) : _select.push(type.value));
        this.callback(_select);
    }

    render = () => {
        const { route : { currentLanguage : { value : language } } } = this.props;
        const { CheckableTag } = Tag;

        return !!this.props.tagMode ? 
        (<React.Fragment>
            <div style={{margin : "0.8rem auto 0.2rem"}}>
                <b>{this.props.translations.initDone && intl.get("general.title.evi_resource")}</b>
                {this.$$eviCourseOpt.map(tag => (
                    <CheckableTag
                        key={tag.value}
                        checked={this.state.selected.indexOf(tag.value) > -1}
                        onChange={checked => this.typeCallback(tag , checked)}
                        style={{font:"14px" , padding:"2px 7px"}}
                    >
                        {tag.label}
                    </CheckableTag>
                ))}
                {this.$$eviCourseTag.map(tag => (
                    <CheckableTag
                        key={tag.value}
                        checked={(Array.isArray(this.state.tag) ? this.state.tag.indexOf(tag.value) > -1 : false)}
                        onChange={checked => this.tagCallback(tag , checked)}
                        style={{font:"14px" , padding:"2px 7px"}}
                    >
                        {tag.label[`${language}`]}
                    </CheckableTag>
                ))}
            </div>
            
            <div style={{margin : "0.8rem auto 0.2rem"}}>
                {this.state.selected.indexOf("teach_guide") > -1 && this.$$teachGuideCat.map(tag => (
                <CheckableTag
                    key={tag.value}
                    checked={(Array.isArray(this.state.tag) ? this.state.tag.indexOf(tag.value) > -1 : false)}
                    onChange={checked => this.tagCallback(tag , checked)}
                    style={{font:"14px" , padding:"2px 7px"}}
                >{tag.label[`${language}`]}</CheckableTag>
                ))}
            </div>
            <div style={{margin : "0.8rem auto 0.2rem"}}>
                {this.state.selected.indexOf("teach_guide") > -1 && this.$$teachGuideTheme.map(tag => (
                <CheckableTag
                    key={tag.value}
                    checked={(Array.isArray(this.state.tag) ? this.state.tag.indexOf(tag.value) > -1 : false)}
                    onChange={checked => this.tagCallback(tag , checked)}
                    style={{font:"14px" , padding:"2px 7px"}}
                >{tag.label[`${language}`]}</CheckableTag>
                ))}
            </div>
            {/* IMAGE MULTI-LEVEL SEARCH --- START */}
            <div>
                 {this.state.selected.indexOf("img_real,img_cartoon,img_line_graph") > -1 && ["img_real","img_cartoon","img_line_graph"].map(tag => (
                <CheckableTag
                    key={tag}
                    checked={this.state.ignore.indexOf(tag) > -1}
                    onChange={checked => this.ignoreCallback(tag)}
                    style={{font:"14px" , padding:"2px 7px"}}
                >{this.props.translations.initDone && intl.get(`home.publicMsg.resource_type.${tag}`)}</CheckableTag>
                ))}
            </div>
            <div style={{margin : "0.8rem auto 0.2rem"}}>
                {this.state.selected.indexOf("img_real,img_cartoon,img_line_graph") > -1 && this.$$imageCat.map(tag => (
                <CheckableTag
                    key={tag.value}
                    checked={(Array.isArray(this.state.tag) ? this.state.tag.indexOf(tag.value) > -1 : false)}
                    onChange={checked => this.tagCallback(tag , checked)}
                    style={{font:"14px" , padding:"2px 7px"}}
                >{tag.label[`${language}`]}</CheckableTag>
                ))}
            </div>
             <div>
                {this.state.selected.indexOf("img_real,img_cartoon,img_line_graph") > -1 && this.$$imageCat.map(tag => 
                this.state.tag.indexOf(tag.value) > -1 && tag.sub_cat.map(_keyword => (<CheckableTag
                    key={_keyword.value}
                    checked={(Array.isArray(this.state.tag) ? this.state.tag.indexOf(_keyword.value) > -1 : false)}
                    onChange={checked => this.tagCallback(_keyword , checked)}
                    style={{font:"14px" , padding:"2px 7px"}}
                >{_keyword.label[`${language}`]}</CheckableTag>
                )))}
            </div>

            <div style={{margin : "0.8rem auto 0.2rem"}}>
                <b>{this.props.translations.initDone && intl.get("general.title.school_resource")}</b>
                {this.$$schoolCourseOpt.map(tag => (
                    <CheckableTag
                        key={tag.value}
                        checked={this.state.selected.indexOf(tag.value) > -1}
                        onChange={checked => this.typeCallback(tag , checked)}
                        style={{font:"14px" , padding:"2px 7px"}}
                    >
                        {tag.label}
                    </CheckableTag>
                ))}
            </div>

            <div style={{margin : "0.8rem auto 0.2rem"}}>
                <b>{this.props.translations.initDone && intl.get("general.title.school_keyword")}</b>
                {this.state.schoolKeyWord.map(tag => (
                    <CheckableTag
                        key={tag.name}
                        checked={(Array.isArray(this.state.tag) ? this.state.tag.indexOf(tag.name) > -1 : false)}
                        onChange={checked => this.tagCallback(tag , checked)}
                        style={{font:"14px" , padding:"2px 7px"}}
                    >
                        {tag.name}
                    </CheckableTag>
                ))}
            </div>

            {/* IMAGE MULTI-LEVEL SEARCH --- END */}
        </React.Fragment>) : 
            (<Checkbox.Group
            options={this.$$defaultOpt}
            value={this.state.selected || []}
            onChange={this.callback}
            />);
    }
    
}

function mapStateToProps({ route, user, translations }) {
  return {
    route,
    user,
    translations
  };
}

export default connect(mapStateToProps)(selectType);