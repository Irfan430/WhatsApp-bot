import moment from 'moment';

// Store user command timestamps
const userCommandHistory = new Map();

/**
 * Flood control middleware to prevent spam
 * @param {string} userId - User ID
 * @param {number} maxCommandsPerMinute - Maximum commands allowed per minute
 * @returns {boolean} - True if user can execute command, false if rate limited
 */
export default async function floodControl(userId, maxCommandsPerMinute = 10) {
    try {
        const now = moment();
        const oneMinuteAgo = now.clone().subtract(1, 'minute');

        // Get user's command history
        if (!userCommandHistory.has(userId)) {
            userCommandHistory.set(userId, []);
        }

        const userHistory = userCommandHistory.get(userId);

        // Remove commands older than 1 minute
        const recentCommands = userHistory.filter(timestamp => 
            moment(timestamp).isAfter(oneMinuteAgo)
        );

        // Update user history with recent commands only
        userCommandHistory.set(userId, recentCommands);

        // Check if user has exceeded rate limit
        if (recentCommands.length >= maxCommandsPerMinute) {
            return false;
        }

        // Add current command timestamp
        recentCommands.push(now.toISOString());
        userCommandHistory.set(userId, recentCommands);

        // Clean up old entries periodically (every 100 checks)
        if (Math.random() < 0.01) {
            cleanupOldEntries();
        }

        return true;
    } catch (error) {
        console.error('Error in flood control:', error);
        return true; // Allow command if there's an error
    }
}

/**
 * Clean up old entries from memory
 */
function cleanupOldEntries() {
    const tenMinutesAgo = moment().subtract(10, 'minutes');
    
    for (const [userId, timestamps] of userCommandHistory.entries()) {
        const recentTimestamps = timestamps.filter(timestamp => 
            moment(timestamp).isAfter(tenMinutesAgo)
        );
        
        if (recentTimestamps.length === 0) {
            userCommandHistory.delete(userId);
        } else {
            userCommandHistory.set(userId, recentTimestamps);
        }
    }
}