import React from "react";

export default function NotFound() {
    return (
            <div className="d-flex" style={{height: "calc((100vh - 80px) - 70px)" , alignItems: "center" , justifyContent: "center" , flexDirection: "column"}}>
                <h1 >404</h1>
                <h2>Oops! Page Not Be Found</h2>
                <p>Sorry but the page you are looking for does not exist, have been removed. name changed or is temporarily unavailable</p>
                <a href="/">Back to homepage</a>
            </div>
            );
}
