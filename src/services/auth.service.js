import apiClient from './api-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
    /**
     * Sign up a new user.
     * @param {Object} userData - { username, email, password, gradeLevel }
     * @returns {Promise<Object>} API response data
     */
    async signUp(userData) {
        try {
            // Note: the backend expects us to map 'name' to 'username' on the UI side,
            // so we assume userData comes structured correctly.
            const response = await apiClient.post('/auth/sign-up', userData);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Log in a user.
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>} API response data with tokens and user info
     */
    async signIn(email, password) {
        try {
            const response = await apiClient.post('/auth/sign-in', { email, password });
            
            // Store tokens and user on success
            const { accessToken, refreshToken, user } = response.data;
            if (accessToken && refreshToken) {
                await AsyncStorage.setItem('accessToken', accessToken);
                await AsyncStorage.setItem('refreshToken', refreshToken);
                await AsyncStorage.setItem('user', JSON.stringify(user));
            }
            
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Log out the current user.
     */
    async signOut() {
        try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
                await apiClient.post('/auth/sign-out', { refreshToken });
            }
        } catch (error) {
            console.error('Sign Out Error', error);
        } finally {
            // Always clear local storage even if API call fails
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
    }

    /**
     * Parse and structure API errors.
     */
    _handleError(error) {
        if (error.response && error.response.data) {
            return {
                status: error.response.status,
                message: error.response.data.message || 'An error occurred',
                originalError: error
            };
        }
        return {
            status: 500,
            message: error.message || 'Network error',
            originalError: error
        };
    }
}

export default new AuthService();
