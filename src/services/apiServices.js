import { API_URL } from '../config/constants.js';
import axios from 'axios';

//Configuracion de la API con axios
const n16Api = axios.create({
    baseURL: API_URL,
});

//Interceptor para agregar el token de autenticacion a las peticiones de la API si es necesario
n16Api.interceptors.request.use(config => {
    if(config.bearerToken) {
        let bearer = `Bearer ${config.bearerToken}`
        config.headers.Authorization = bearer
    }
    
    return config;
});

export default n16Api;