import fs from 'fs-extra';
import moment from 'moment';

// Track bot start time
const botStartTime = Date.now();

export default {
    name: 'stats',
    description: 'Show bot statistics',
    usage: 'stats',
    aliases: ['statistics', 'info'],
    
    async execute(message, args, { client, config, getText, logger, fileHelper }) {
        try {
            // Get user count
            const usersPath = './data/users.json';
            let userCount = 0;
            if (await fs.pathExists(usersPath)) {
                const users = await fs.readJson(usersPath);
                userCount = Object.keys(users).length;
            }

            // Get command count
            const logsPath = './data/logs.json';
            let commandCount = 0;
            if (await fs.pathExists(logsPath)) {
                const logs = await fs.readJson(logsPath);
                commandCount = logs.length;
            }

            // Calculate uptime
            const uptime = moment.duration(Date.now() - botStartTime);
            const uptimeString = `${uptime.days()}d ${uptime.hours()}h ${uptime.minutes()}m ${uptime.seconds()}s`;

            // Get memory usage
            const memUsage = process.memoryUsage();
            const memUsageMB = Math.round(memUsage.rss / 1024 / 1024);

            let statsText = `${getText('stats_title')}\n\n`;
            statsText += `${getText('stats_users', { count: userCount })}\n`;
            statsText += `${getText('stats_commands', { count: commandCount })}\n`;
            statsText += `${getText('stats_uptime', { time: uptimeString })}\n`;
            statsText += `💾 Memory Usage: ${memUsageMB}MB\n`;
            statsText += `🤖 Bot Version: ${config.BOT_VERSION}\n`;
            statsText += `📱 WhatsApp Number: ${config.BOT_NUMBER}\n`;
            statsText += `🌐 Language: ${config.LANGUAGE.toUpperCase()}\n`;
            statsText += `⚡ Prefix: ${config.PREFIX}`;

            await message.reply(statsText);
            
        } catch (error) {
            logger.error('Error in stats command:', error);
            await message.reply(getText('error_occurred'));
        }
    }
};