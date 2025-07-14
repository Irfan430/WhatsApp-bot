export default {
    name: 'menu',
    description: 'Display all available commands',
    usage: 'menu',
    aliases: ['help', 'commands'],
    
    async execute(message, args, { client, config, getText, logger }) {
        try {
            const userCommands = [
                '!menu - Show this menu',
                '!sticker - Convert image/video to sticker',
                '!ytmp3 <url> - Download YouTube audio',
                '!ping - Check bot response time',
                '!stats - Show bot statistics'
            ];

            const adminCommands = [
                '!broadcast <message> - Send message to all users',
                '!shutdown - Shutdown the bot',
                '!addadmin <number> - Add admin (owner only)',
                '!removeadmin <number> - Remove admin (owner only)'
            ];

            let menuText = `${getText('menu_title')}\n\n`;
            menuText += `${getText('menu_user_commands')}\n`;
            
            userCommands.forEach(cmd => {
                menuText += `• ${cmd}\n`;
            });

            menuText += `\n${getText('menu_admin_commands')}\n`;
            
            adminCommands.forEach(cmd => {
                menuText += `• ${cmd}\n`;
            });

            menuText += `\n${getText('menu_footer', { prefix: config.PREFIX })}`;
            menuText += `\n\n🤖 *${config.BOT_NAME}* v${config.BOT_VERSION}`;

            await message.reply(menuText);
            
        } catch (error) {
            logger.error('Error in menu command:', error);
            await message.reply(getText('error_occurred'));
        }
    }
};