import apiClient from './apiManager';

class GameAnalyticsService {
    /**
     * Get the leaderboard for a section (students ranked by average score)
     * @param {string} sectionId
     */
    async getSectionLeaderboard(sectionId) {
        try {
            const response = await apiClient.get(`/game-submissions/analytics/section/${sectionId}/leaderboard`);
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    }

    /**
     * Get the leaderboard for a classroom (all sections, ranked by average score)
     * @param {string} classroomId
     */
    async getClassroomLeaderboard(classroomId) {
        try {
            const response = await apiClient.get(`/game-submissions/analytics/classroom/${classroomId}/leaderboard`);
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

export default new GameAnalyticsService();
