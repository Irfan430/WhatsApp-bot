export default {
    name: 'shutdown',
    description: 'Gracefully shutdown the bot',
    usage: 'shutdown',
    aliases: ['stop', 'exit'],
    adminOnly: true,
    
    async execute(message, args, { client, config, getText, logger }) {
        try {
            await message.reply(getText('shutdown_initiated'));
            
            logger.warn('Bot shutdown initiated by admin:', message.from);
            
            // Give some time for the message to be sent
            setTimeout(async () => {
                logger.info('Shutting down bot...');
                await client.destroy();
                process.exit(0);
            }, 2000);

        } catch (error) {
            logger.error('Error in shutdown command:', error);
            await message.reply(getText('error_occurred'));
        }
    }
};