import apiClient from './apiManager';

class SubmissionService {
    /**
     * Get the current student's submission for an assignment
     * @param {string} assignmentId 
     */
    async getMySubmission(assignmentId) {
        try {
            const response = await apiClient.get(`/submissions/assignments/${assignmentId}/students`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Create a submission (uploading files)
     * @param {string} assignmentId 
     * @param {FormData} formData 
     */
    async createSubmission(assignmentId, formData) {
        try {
            const response = await apiClient.post(`/submissions/assignments/${assignmentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Update an existing submission
     * @param {string} submissionId 
     * @param {string} assignmentId 
     * @param {FormData} formData 
     */
    async updateSubmission(submissionId, assignmentId, formData) {
        try {
            const response = await apiClient.put(`/submissions/${submissionId}/assignments/${assignmentId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
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

export default new SubmissionService();
