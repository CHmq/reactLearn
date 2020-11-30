import React from "react";

export default class StarMarking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clickIndex: 0,
      hoverIndex: 0
    };
    this.getStar = this.getStar.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleOnMouseEnter = this.handleOnMouseEnter.bind(this);
    this.handleOnMouseOut = this.handleOnMouseOut.bind(this);
    this.changeMarkingScore = this.changeMarkingScore.bind(this);
  }

  handleClick(index) {
    this.setState({
      clickIndex: index
    });
    this.changeMarkingScore(index);
  }

  handleOnMouseEnter(index) {
    this.setState({
      hoverIndex: index
    });
  }

  handleOnMouseOut() {
    this.setState({
      hoverIndex: 0
    });
  }

  changeMarkingScore(index) {
    let item = {
      score: index
    };
    this.props.value(item); 
  }

  getStar() {
    let num =
      this.state.hoverIndex === 0
        ? this.state.clickIndex
        : this.state.hoverIndex;
        
    let starContainer = [];
    const arr = [1, 2, 3, 4, 5];
    arr.map((ele, index) => {
      
      starContainer.push(
        <span
          className="staricon"
          onClick={this.handleClick.bind(this, ele)}
          onMouseEnter={this.handleOnMouseEnter.bind(this, ele)}
          onMouseOut={this.handleOnMouseOut.bind(this)}
          key={index}
        >
          {ele > (this.props.data?this.props.data:num) ? (
            <span style={{ color: "#ccc" ,fontSize:"28px",padding: "0px 5px"}} >☆</span>
          ) : (
            <span  style={{ color: "#faad14",fontSize:"28px",padding: "0px 5px" }} >★</span>
          )}
        </span>
      );
      return null;
    });
    return starContainer;
  }

  render() {
    let starItems = this.getStar();
    return (
      <div className="starmarking" key={1}>
        <div className="starcontainer">{starItems}</div>
      </div>
    );
  }
}
