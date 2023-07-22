import axios from 'axios';

const AUTH_TOKEN = '38365301-8fc0cf151ce2e32a6ee0bdda0';
axios.defaults.baseURL = `https://pixabay.com/api/`;

export async function searchByQuery(query, page) {
    return axios.get(`?key=${AUTH_TOKEN}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`)
};