import { useLocation, useNavigate, Link, matchPath } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

import './index.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { config } from '~shared/lib/sidebar/config.js';

const TITLE = import.meta.env.VITE_TITLE;

/*

    Side Bar 내용을 수정하고 싶은 거면
    ~shared/sidebar/config.js로 이동

*/

const $linkWrap = ({ id, data, isOpen, toggleOpen, watching, click, check }) => {
    const contentRef = useRef(null);
    const [ maxHeight, setMaxHeight ] = useState("0px");

    useEffect(() => {
        if (contentRef.current) {
            if (isOpen) setMaxHeight(`${contentRef.current.scrollHeight}px`); 
            else setMaxHeight('0px');
        }
    }, [isOpen]);

    const isWatching = data.links.some(link => matchPath({ path: link.pathKey.link, end: false }, watching));

    return (
        <ul className={`linkWrap ${isWatching ? "watching" : ""} ${isOpen ? "menu-open" : ""}`}>
            {
                data.header ? 
                <li className="link headerLink" onClick={() => toggleOpen(id)}>
                    <FontAwesomeIcon className="icon" icon={data.header.icon} />
                    <h1 className="links">{data.header.name}</h1>
                    <FontAwesomeIcon className="slide" icon="fa-angle-left" />
                </li>

                : <></>
            }
            
            <div className="wrap" ref={contentRef} style={{ maxHeight }}>
                { data.links.map((link, idx) => {
                    if (!check(link.pathKey)) return "";

                    else return(
                        <li key={idx} className={`link${matchPath({ path: link.pathKey.link, end: false }, watching) ? " watching" : ""}`}
                            onClick={() => {click(link.pathKey)}}>
                            <FontAwesomeIcon className="icon" icon={link.icon} />
                            <p className="links">{link.name}</p>
                        </li>
                    );
                })}
            </div>
        </ul>
    );
};

const $group = ({ id, data, watching, click, check }) => {
    const [ openGroups, setOpenGroups ] = useState(() => {
        const initialState = {};
        data.wraps.forEach((_, idx) => {
            initialState[idx] = true;
        });
        return initialState;
    });

    const toggleOpen = (id) => {
        setOpenGroups(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const wrapsValid = data.wraps.map((wrap, idx) => {
        const isValid = wrap.links.map((x, idx) => {
            return check(x.pathKey);
        }).reduce((x, y) => x || y);

        return isValid;
    });

    const groupValid = wrapsValid.reduce((x, y) => x || y);

    if (groupValid) return (
        <div className={`group ${data.legend ? "" : "noLegend"}`}>
            { data.legend ? <h1 className="legend">{data.legend}</h1> : <></> }
            { data.wraps.map((wrap, idx) => {
                if (wrapsValid[idx]) return (
                    <$linkWrap 
                        key={idx} 
                        id={idx} 
                        data={wrap} 
                        watching={watching} 
                        isOpen={openGroups[idx]}
                        toggleOpen={toggleOpen}
                        click={click}
                        check={check}
                    />
                );

                else return "";
            })}
        </div>
    );

    else return "";
};

function SideBar(props) {
    const [ data, setData ] = useState();
    const location = useLocation();
    const navigate = useNavigate();
    const { userPermissions } = props;

    useEffect(() => {
        setData(config);
    }, []);

    function pageTo(pathKey){
        if (!pathKey.permission || userPermissions.has(pathKey.permission)) navigate(pathKey.link);
    }

    function validPermission(pathKey){
        if (!pathKey.permission || userPermissions.has(pathKey.permission)) return true;
        else return false;
    }

    return (
        <div className="sidebar">
            <div className="sidebar_wrap">
                <div className="head">
                    <img src="/jshs.png" className="logo" />
                    <h1 className="title">
                        <span>전남과학고등학교</span>
                        <span className="subtitle">학생부 전산망</span>
                    </h1>
                </div>
                <div className="body">
                    {data && data.map((x, idx) => (
                        <$group id={idx} key={idx} data={x} watching={location.pathname} click={pageTo} check={validPermission} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SideBar;