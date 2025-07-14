export default {
    name: 'ping',
    description: 'Check bot response time',
    usage: 'ping',
    aliases: ['p'],
    
    async execute(message, args, { client, config, getText, logger }) {
        try {
            const startTime = Date.now();
            const sent = await message.reply('🏓 Pinging...');
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            await sent.edit(getText('ping_response', { ms: responseTime }));
            
        } catch (error) {
            logger.error('Error in ping command:', error);
            await message.reply(getText('error_occurred'));
        }
    }
};