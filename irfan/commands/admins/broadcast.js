import fs from 'fs-extra';

export default {
    name: 'broadcast',
    description: 'Send a message to all bot users',
    usage: 'broadcast <message>',
    aliases: ['bc', 'announce'],
    adminOnly: true,
    
    async execute(message, args, { client, config, getText, logger }) {
        try {
            if (args.length === 0) {
                return await message.reply(getText('broadcast_no_message'));
            }

            const broadcastMessage = args.join(' ');
            const usersPath = './data/users.json';

            if (!await fs.pathExists(usersPath)) {
                return await message.reply('❌ No users found in database.');
            }

            const users = await fs.readJson(usersPath);
            const userIds = Object.keys(users);

            if (userIds.length === 0) {
                return await message.reply('❌ No users found in database.');
            }

            await message.reply(`🔄 Broadcasting message to ${userIds.length} users...`);

            let successCount = 0;
            let failCount = 0;

            // Add broadcast header
            const finalMessage = `📢 *BROADCAST MESSAGE*\n\n${broadcastMessage}\n\n_This message was sent to all bot users._`;

            for (const userId of userIds) {
                try {
                    // Skip if it's the sender
                    if (userId === message.from.replace('@c.us', '')) continue;

                    const chatId = userId.includes('@') ? userId : `${userId}@c.us`;
                    await client.sendMessage(chatId, finalMessage);
                    successCount++;
                    
                    // Add small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (error) {
                    logger.error(`Failed to send broadcast to ${userId}:`, error);
                    failCount++;
                }
            }

            await message.reply(getText('broadcast_sent', { count: successCount }));
            
            if (failCount > 0) {
                await message.reply(`⚠️ Failed to send to ${failCount} users.`);
            }

        } catch (error) {
            logger.error('Error in broadcast command:', error);
            await message.reply(getText('broadcast_error'));
        }
    }
};