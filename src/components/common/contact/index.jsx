import React, { useEffect } from "react";
import { connect } from "react-redux";

import About from "components/common/contact/about";
import Contact from "components/common/contact/contact";
import Privacy from "components/common/contact/privacy";
import Disclaimer from "components/common/contact/disclaimer";
import { Row, Col } from "antd";

const createPage = props => {
  const pages = new Map()
    .set("about_us", <About translations={props.translations} />)
    .set("contact_us", <Contact translations={props.translations} />)
    .set("privacy", <Privacy translations={props.translations} />)
    .set("disclaimer", <Disclaimer translations={props.translations} />);
  return pages.get(props.tag);
};

const index = props => {
  useEffect(() => {
    return () => {
      props.updateFileName("home");
    };
  }, [0]);
  return (
    <Row type="flex" justify="space-around">
      <Col span={20}>{createPage(props)}</Col>
    </Row>
  );
};

function mapStateToProps({ translations }) {
  return { translations };
}

function mapDispatchToProps(dispatch) {
  return {
    updateFileName: payload => dispatch({ type: "updateFileName", payload })
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(index);
