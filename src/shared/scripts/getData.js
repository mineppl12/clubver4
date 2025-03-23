import axios from "axios";

async function getData(url, params = {}, withCredentials = false){
    const response = await axios.get(`${url}`, {
        params: params
    }, { withCredentials });

    return response.data;
}

async function postData(url, params = {}){
    const response = await axios.post(`${url}`, {
        params: params
    });

    return response.data;
}

async function putData(url, params = {}){
    const response = await axios.put(`${url}`, {
        params: params
    });

    return response.data;
}

export {getData, postData, putData};