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
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return Promise.resolve({ data: user ? JSON.parse(user) : null });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return Promise.resolve();
    },
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
    getByKurir: (kurirId: number, tanggal?: string) =>
        api.get(`/pengiriman/kurir/${kurirId}${tanggal ? `?tanggal=${tanggal}` : ''}`),
    getUnassigned: (tanggal?: string) =>
        api.get(`/pengiriman/unassigned${tanggal ? `?tanggal=${tanggal}` : ''}`),
    getMyDeliveries: () => api.get('/pengiriman/my-deliveries'),
    create: (data: any) => api.post('/pengiriman', data),
    update: (id: number, data: any) => api.put(`/pengiriman/${id}`, data),
    delete: (id: number) => api.delete(`/pengiriman/${id}`),
};

// Route Optimization API
export const routeAPI = {
    optimize: (data: { kurir_id: number; pengiriman_ids: number[]; tanggal_kirim?: string }) =>
        api.post('/route/optimize', data),
    getHistory: () => api.get('/route/history'),
    getMyRoute: () => api.get('/route/my-route'),
    getDetail: (id: number) => api.get(`/route/history/${id}`),
    getKurirRoute: (kurirId: number, tanggal?: string) =>
        api.get(`/route/kurir-route/${kurirId}${tanggal ? `?tanggal=${tanggal}` : ''}`),
};

// User Management API
export const userAPI = {
    getAll: () => api.get('/users'),
    getById: (id: number) => api.get(`/users/${id}`),
    create: (data: any) => api.post('/users', data),
    update: (id: number, data: any) => api.put(`/users/${id}`, data),
    delete: (id: number) => api.delete(`/users/${id}`),
    resetPassword: (id: number, data: any) => api.put(`/users/${id}/password`, data)
};

export default api;
