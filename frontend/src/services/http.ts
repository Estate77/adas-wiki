import axios, { type AxiosInstance, type AxiosError } from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

export const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入 JWT
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('adas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：统一错误
http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ message?: string }>) => {
    const msg = err.response?.data?.message || err.message || '请求失败';
    return Promise.reject(new Error(msg));
  },
);
