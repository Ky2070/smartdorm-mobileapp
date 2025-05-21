import axios from "axios";
import Config from 'react-native-config';

const BASE_URL = Config.BASE_URL; //Change your BASE_URL

export const endpoints = {
    'buildings': '/buildings/',
    'rooms': '/rooms/',
    'invoices':'/invoices/',
    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/'
}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
})