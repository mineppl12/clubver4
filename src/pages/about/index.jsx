import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

function About(){

    return(
        <>
        <div id="about">
            동아리 모집 프로그램임<br/>
            Made By WDWIZ {'{'}IDBI{'}'}, Blight Studioz {'{'}IDBI{'}'}<br/>
            With Jshsus<br/>
            Software Responsibility (SR): WDWIZ {'{'}IDBI{'}'} , Blight Stduioz {'{'}IDBI{'}'}, IDBI UNION<br/>
            Powered By: Jshsus (jshsus.kr)<br/>
            <b>32기 강재환 & 32기 김성찬</b><br/>
            성찬아 너무 고생 많았구 고맙다 ㅠㅠㅠ
        </div>
        </>
    )
}

export default About;