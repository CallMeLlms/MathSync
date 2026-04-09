import apiClient from './apiManager';
import lessonCacheService from './lessonCacheService';
import NetInfo from '@react-native-community/netinfo';

class LessonService {
    
    /**
     * Get isolated lesson details by ID
     * Uses offline first or network first approach depending on connectivity
     * @param {string} id 
     */
    async getLessonById(id) {
        try {
            // Check network status
            const netInfo = await NetInfo.fetch();
            
            if (!netInfo.isConnected) {
                // Return cached lesson immediately if offline
                const cachedLesson = await lessonCacheService.getLessonFromCache(id);
                if (cachedLesson) {
                    return { success: true, data: cachedLesson, fromCache: true };
                }
                throw new Error('No internet connection and lesson not available offline.');
            }

            // Fetch from network
            const response = await apiClient.get(`/lessons/${id}`);
            
            // If fetch successful, cache it automatically
            if (response.data && response.data.data) {
                await lessonCacheService.cacheLesson(response.data.data);
            }
            
            return {
               success: true,
               data: response.data.data,
               fromCache: false
            };
        } catch (error) {
            // Attempt fallback if network fails
            const cachedLesson = await lessonCacheService.getLessonFromCache(id);
            if (cachedLesson) {
                return { success: true, data: cachedLesson, fromCache: true };
            }
            
            throw this._handleError(error);
        }
    }

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

export default new LessonService();
