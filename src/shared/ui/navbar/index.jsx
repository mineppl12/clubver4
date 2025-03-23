import { useLocation, useNavigate, matchPath } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import accessKey from "~shared/scripts/accessKey.js";
import { getData, postData } from "~shared/scripts/getData.js";

import "./index.scss";
import { pathKeys } from "~shared/lib/react-router/pathKey.js";

const Navbar = (props) => {
    const navigate = useNavigate();

    const [ userName, setUserName ] = useState("로그인");
    const [ isLogined, setIsLogined ] = useState(false);

    useEffect(() => {
        init();
    }, []);

    async function init(){
        const sessionID = props.sessionID;
        let data = await getData("https://iam.jshsus.kr/iam2", {sessionID});

        if (typeof data === "string") data = JSON.parse(data);

        if (data.isLogined){
            setUserName(data.name);
            setIsLogined(true);
        }
    }

    function doLogin(logined){
        if (!logined) window.location.href = "https://iam.jshsus.kr/?service=iam2";
    }

    return (
        <div className="navbar">
            <div className="navbar_wrap">
                <div className="nav-item account">
                    <p className="nav-link account_name" onClick={() => {doLogin(isLogined)}}>{userName}</p>
                </div>
            </div>
        </div>
    );
};

export default Navbar;