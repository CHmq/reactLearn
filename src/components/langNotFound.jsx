import React from "react";

export default function langNotFound(props) {
  // console.log(props);

  return (
    <div>
      <h1>This is {props.match.path} Not Found</h1>
    </div>
  );
}
