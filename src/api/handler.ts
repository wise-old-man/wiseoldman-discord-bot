import axios from 'axios';
import config from '../config';

const API = axios.create({
  baseURL: config.baseAPIUrl,
  timeout: 60000,
  headers: { 'User-Agent': 'WiseOldMan Discord Bot' }
});

export default API;
