import * as SQLite from 'expo-sqlite';

let db = null;

const getDb = async () => {
    if (db) return db;
    db = await SQLite.openDatabaseAsync('mathsync_lessons.db');
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS lessons_cache (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT,
            description TEXT,
            gradeLevel INTEGER,
            learningObjectives TEXT,
            lessonContent TEXT,
            learningCompetencies TEXT,
            videoUrl TEXT,
            duration INTEGER,
            lastUpdated INTEGER
        );
    `);
    return db;
};

class LessonCacheService {
    
    /**
     * Cache a full lesson object in SQLite
     * @param {Object} lesson 
     */
    async cacheLesson(lesson) {
        try {
            const database = await getDb();
            const now = Date.now();
            
            // Convert arrays/objects to JSON strings for SQLite
            const learningObjectives = JSON.stringify(lesson.learningObjectives || []);
            const lessonContent = JSON.stringify(lesson.lessonContent || {});
            const learningCompetencies = JSON.stringify(lesson.learningCompetencies || []);

            await database.runAsync(
                `INSERT OR REPLACE INTO lessons_cache 
                (id, title, description, gradeLevel, learningObjectives, lessonContent, learningCompetencies, videoUrl, duration, lastUpdated) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    lesson._id,
                    lesson.title || '',
                    lesson.description || '',
                    lesson.gradeLevel || 1,
                    learningObjectives,
                    lessonContent,
                    learningCompetencies,
                    lesson.videoUrl || '',
                    lesson.duration || 30,
                    now
                ]
            );
            return true;
        } catch (error) {
            console.error('Error caching lesson in SQLite:', error);
            return false;
        }
    }

    /**
     * Get a lesson from the SQLite cache
     * @param {string} id 
     * @returns {Object|null} 
     */
    async getLessonFromCache(id) {
        try {
            const database = await getDb();
            const result = await database.getFirstAsync('SELECT * FROM lessons_cache WHERE id = ?', [id]);
            
            if (result) {
                // Parse the JSON strings back to arrays/objects
                return {
                    _id: result.id,
                    title: result.title,
                    description: result.description,
                    gradeLevel: result.gradeLevel,
                    learningObjectives: JSON.parse(result.learningObjectives),
                    lessonContent: JSON.parse(result.lessonContent),
                    learningCompetencies: JSON.parse(result.learningCompetencies),
                    videoUrl: result.videoUrl,
                    duration: result.duration
                };
            }
            return null;
        } catch (error) {
            console.error('Error reading lesson from SQLite:', error);
            return null;
        }
    }
}

export default new LessonCacheService();
