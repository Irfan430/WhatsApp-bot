/**
 * Middleware to check if a user is an admin or owner
 * @param {string} userId - User ID to check
 * @param {object} config - Bot configuration
 * @returns {boolean} - True if user is admin or owner
 */
export default async function isAdmin(userId, config) {
    try {
        // Check if user is the owner
        if (userId === config.OWNER_NUMBER) {
            return true;
        }

        // Check if user is in admin list
        if (config.ADMINS && Array.isArray(config.ADMINS)) {
            return config.ADMINS.includes(userId);
        }

        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}