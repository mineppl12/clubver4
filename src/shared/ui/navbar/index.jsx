import { useLocation, useNavigate, matchPath } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import "./index.scss";
import { pathKeys } from "~shared/lib/react-router/pathKey.js";

const Navbar = () => {
    const [ userName, setUserName ] = useState();

    useEffect(() => {
        init();
    }, []);

    function init(){
        setUserName("강재환");
    }

    return (
        <div className="navbar">
            <div className="navbar_wrap">
                <div className="nav-item account">
                    <p className="nav-link account_name">{userName}</p>
                </div>
            </div>
        </div>
    );
};

export default Navbar;