import axios from 'axios';

export const noaaClient = axios.create({
    baseURL: 'https://aviationweather.gov/api/data',
    timeout: 5000,
    headers: {
        Accept: 'application/json',
        'User-Agent': 'SkyBrief API (andres_belgy@msn.com)',
        From: 'andres_belgy@msn.com'
    }
});