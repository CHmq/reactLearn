import React, { Component } from "react";
import { connect } from "react-redux";

import ScrollAnim from 'rc-scroll-anim';

import EVICourse from "components/course/CourseTemplate";

const Link = ScrollAnim.Link;
const Element = ScrollAnim.Element;
const ScrollOverPack = ScrollAnim.OverPack;
const EventListener = ScrollAnim.Event;

class OPCourse extends Component {

    constructor(props) {
        super(props);
        console.log(this.props);
    }

    componentDidMount = async() => {
        ScrollAnim.scrollScreen.init();
    }

    componentWillUnmount = async() => {
        ScrollAnim.scrollScreen.unMount();
    }

    render() {
        return (
                <div style={{marginTop : "76px"}}>
                    <Element className="pack-page page0" id="page0" key={"page0"} style={{height:"2000px"}}>
                        <div className="page-title">
                            <p>4123</p>
                        </div>
                        <div className="page-description"style={{height:"600px"}}>
                            <p>A scrollScreen demo</p>
                        </div>
                    </Element>
                    <Element className="pack-page page1" id="page1"  key={"page1"} style={{height:"1500px"}}>
                        <div className="page-title" >
                            <p>4123</p>
                        </div>
                        <div className="page-description"  style={{height:"600px"}}>
                            <p>A scrollScreen demo</p>
                        </div>
                    </Element>
                </div>);
    }
}

export default OPCourse;