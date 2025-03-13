import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const TITLE = import.meta.env.VITE_TITLE;

import { setCookie, getCookie } from '~shared/scripts/cookies';

function Users(){
    const navigate = useNavigate();

    useEffect(() => {
        handleLogin();
    }, []);

    async function handleLogin(){
        const searchParams = new URLSearchParams(location.search);
        const accessKey = searchParams.get('accessKey');
        
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);

        setCookie("jshsusIAM2", accessKey, 
            {
              path: '/',
              expires: expireDate,
            });

        navigate("/");
    }

    return(
        <>
        <div id="home">
            
        </div>
        </>
    )
}

export default Users;