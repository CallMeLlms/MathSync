/**
 * src/utils/gradeMapping.js
 * 
 * Utility functions for handling grade conversions and authorization logic.
 */

const MASTER_CREDENTIAL = 'admin@mathsync.com';

/**
 * Converts various grade representations into a unified store key format.
 * - 1 -> 'G1'
 * - '1' -> 'G1'
 * - 'G1' -> 'G1'
 * 
 * @param {string|number} grade - The raw grade from backend or input
 * @returns {string|null} The normalized grade key, or null if invalid
 */
export const normalizeGrade = (grade) => {
    if (grade === null || grade === undefined || grade === '') return null;
    
    const strGrade = String(grade).toUpperCase().trim();
    
    // If it's already in the correct format
    if (strGrade.startsWith('G') && strGrade.length === 2 && !isNaN(strGrade[1])) {
        return strGrade;
    }
    
    // If it's just a number
    if (!isNaN(strGrade) && Number(strGrade) >= 1 && Number(strGrade) <= 6) {
        return `G${strGrade}`;
    }

    return null; // Return null if it doesn't match expected patterns
};

/**
 * Determines if a user profile is authorized to access a specific grade level.
 * 
 * Hierarchy:
 * 1. Master Accounts have access to all grades.
 * 2. Guest Users (no profile) have access to all grades (for testing defaults).
 * 3. Registered Students only have access to their registered grade.
 * 
 * @param {string} requestedGrade - The grade trying to be accessed (e.g. 'G1')
 * @param {Object} profile - The user profile state from useUserStore
 * @returns {boolean} True if authorized, false otherwise
 */
export const isGradeAuthorized = (requestedGrade, profile) => {
    // If no grade is requested, technically true (home screen)
    if (!requestedGrade) return true;

    // Master bypass
    if (profile?.isMaster) return true;

    // Guest Mode (If no email is associated, treat as guest allowing all access for testing)
    if (!profile?.email) return true;

    // Registered Student Mode
    const normalizedRequest = normalizeGrade(requestedGrade);
    const normalizedRegistration = normalizeGrade(profile.registeredGrade);

    return normalizedRequest === normalizedRegistration;
};

export const MathSyncAdmins = {
    MASTER_CREDENTIAL
};
