import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import './index.scss';

const TITLE = import.meta.env.VITE_TITLE;

function Home(){
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/about");
    }, []);

    return(
        <>
        <div id="home">
            
        </div>
        </>
    )
}

export default Home;