import { getData, postData } from "~shared/scripts/getData.js";

import { setCookie, getCookie } from '~shared/scripts/cookies';

async function accessKey(){
    const sessionID = getCookie("jshsusIAM2");

    return sessionID;
}

export default accessKey;