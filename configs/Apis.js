import axios from "axios";
const BASE_URL = 'https://thanhduong.pythonanywhere.com/'; //Change your BASE_URL

export const endpoints = {
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