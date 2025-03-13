import {Cookies} from 'react-cookie';

const cookies = new Cookies();

const setCookie = (name, value, options = {}) => {
 	return cookies.set(name, value, {...options}); 
}

const getCookie = (name) => {
    return cookies.get(name); 
}

export {setCookie, getCookie};