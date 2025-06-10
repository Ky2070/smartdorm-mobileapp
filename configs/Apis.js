import axios from "axios";
import Config from 'react-native-config';

const BASE_URL = 'https://nquocky.pythonanywhere.com/'; //Change your BASE_URL
// Config.BASE_URL;
export const endpoints = {
    'buildings': '/building/',
    'rooms': '/room/',
    'register-room': '/register-room/',
    'room-swap': '/room-swap/',
    'invoices':'/invoice/',
    'invoice-detail':'/invoice-detail/',
    'fee-type':'/fee-type/',
    'login': '/o/token/',
    'register': '/users/',
    'current-user': '/users/current-user/',
    'fcm':'/fcm/',
    'my-room': '/users/my-room/',
    'list-swap':'/room-swap/admin-list/',
}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
};

export default axios.create({
    baseURL: BASE_URL
})