import axios from 'axios';
import { Platform } from 'react-native';

// Base URL configurável por variável de ambiente (ex: API_URL)
// Fallbacks: web -> localhost, mobile -> original IP (use seu IP local se necessário)
const envApi = (typeof process !== 'undefined' && process.env && process.env.API_URL) ? process.env.API_URL : null;
const defaultMobile = 'http://10.173.27.34:8080/api';
const defaultWeb = 'http://localhost:8080/api';
const baseURL = envApi || (Platform.OS === 'web' ? defaultWeb : defaultMobile);

export const API_BASE = baseURL;

export const api = axios.create({
  baseURL,
});