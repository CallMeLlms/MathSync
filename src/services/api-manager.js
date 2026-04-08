import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base API URL configuration
export const API_BASE_URL = 'http://192.168.100.149:5500/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error fetching token from AsyncStorage', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken
                    });
                    
                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
                    
                    await AsyncStorage.setItem('accessToken', newAccessToken);
                    await AsyncStorage.setItem('refreshToken', newRefreshToken);
                    
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed', refreshError);
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                // Note: Realistically, you could dispatch an event here to hard-logout the user across the app.
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
