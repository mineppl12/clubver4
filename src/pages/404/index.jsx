import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

function Page404(){
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/');
    }, []);

    return(
        <>
        <div id="404">
            404 Error
        </div>
        </>
    )
}

export default Page404;