// app/lib/api.ts

import axios from 'axios';
import { clearAuth, getToken } from './auth';

// API URLs
const SUPER_ADMIN_BASE_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL || 'http://localhost:5000/api/super-admin';

// Super Admin API client
export const superAdminClient = axios.create({
    baseURL: SUPER_ADMIN_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Super Admin Auth API client (for login)
export const superAdminAuthClient = axios.create({
    baseURL: `${SUPER_ADMIN_BASE_URL}/auth`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token to all requests
superAdminClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors only (don't auto-extract data)
superAdminClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            clearAuth();
            if (typeof window !== 'undefined') {
                window.location.href = '/login?session=expired';
            }
        }
        return Promise.reject(error);
    }
);

superAdminAuthClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);