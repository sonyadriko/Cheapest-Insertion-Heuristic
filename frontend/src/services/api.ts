import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
    register: (data: any) => api.post('/auth/register', data),
    getCurrentUser: () => api.get('/auth/me'),
};

// Kurir API
export const kurirAPI = {
    getAll: () => api.get('/kurir'),
    getById: (id: number) => api.get(`/kurir/${id}`),
    create: (data: any) => api.post('/kurir', data),
    update: (id: number, data: any) => api.put(`/kurir/${id}`, data),
    delete: (id: number) => api.delete(`/kurir/${id}`),
};

// Pengiriman API
export const pengirimanAPI = {
    getAll: () => api.get('/pengiriman'),
    getById: (id: number) => api.get(`/pengiriman/${id}`),
    getByKurir: (kurirId: number) => api.get(`/pengiriman/kurir/${kurirId}`),
    getUnassigned: () => api.get('/pengiriman/unassigned'),
    create: (data: any) => api.post('/pengiriman', data),
    update: (id: number, data: any) => api.put(`/pengiriman/${id}`, data),
    delete: (id: number) => api.delete(`/pengiriman/${id}`),
};

// Route API
export const routeAPI = {
    optimize: (data: { kurir_id: number; pengiriman_ids: number[] }) =>
        api.post('/route/optimize', data),
    getHistory: () => api.get('/route/history'),
    getDetail: (id: number) => api.get(`/route/history/${id}`),
};

export default api;
