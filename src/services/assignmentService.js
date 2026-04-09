import apiClient from './apiManager';

class AssignmentService {
    /**
     * Get all assignments for a section
     * @param {string} sectionId 
     */
    async getAssignments(sectionId) {
        try {
            const response = await apiClient.get(`/classrooms/${sectionId}/assignments`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Get details of a specific assignment
     * @param {string} sectionId 
     * @param {string} assignmentId 
     */
    async getAssignmentDetails(sectionId, assignmentId) {
        try {
            const response = await apiClient.get(`/classrooms/${sectionId}/assignments/${assignmentId}`);
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

export default new AssignmentService();
