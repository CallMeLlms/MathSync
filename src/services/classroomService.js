import apiClient from './apiManager';

class ClassroomService {
    /**
     * Join a classroom via joinCode
     * @param {string} joinCode 
     * @returns {Promise<Object>} API response data
     */
    async joinClassroom(classCode) {
        try {
            const response = await apiClient.post('/classrooms/join', { classCode });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Get all joined classrooms for the student
     * @returns {Promise<Object>} List of classrooms with linked sections
     */
    async getMyClassrooms() {
        try {
            const response = await apiClient.get('/classrooms');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Get detailed classroom info
     * @param {string} classId 
     */
    async getClassroomDetails(classId) {
        try {
            const response = await apiClient.get(`/classrooms/${classId}`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Get lessons hierarchically organized by section
     * @param {string} sectionId 
     * @returns {Promise<Object>} Structure containing quarters and lessons
     */
    async getLessonsBySection(sectionId) {
        try {
            const response = await apiClient.get(`/classrooms/sections/${sectionId}/lessons`);
            return response.data;
        } catch (error) {
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

export default new ClassroomService();
