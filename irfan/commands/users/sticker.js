import { MessageMedia } from 'whatsapp-web.js';
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';

export default {
    name: 'sticker',
    description: 'Convert image or video to sticker',
    usage: 'sticker (reply to image/video or send with caption)',
    aliases: ['s', 'stick'],
    
    async execute(message, args, { client, config, getText, logger, fileHelper }) {
        try {
            let media = null;

            // Check if message has media
            if (message.hasMedia) {
                media = await message.downloadMedia();
            }
            // Check if replying to a message with media
            else if (message.hasQuotedMsg) {
                const quotedMsg = await message.getQuotedMessage();
                if (quotedMsg.hasMedia) {
                    media = await quotedMsg.downloadMedia();
                }
            }

            if (!media) {
                return await message.reply(getText('no_media'));
            }

            // Check if media is image or video
            if (!media.mimetype.startsWith('image/') && !media.mimetype.startsWith('video/')) {
                return await message.reply(getText('sticker_error'));
            }

            await message.reply(getText('sticker_processing'));

            // Process the media
            let processedMedia = media;

            // If it's an image, resize it for sticker format
            if (media.mimetype.startsWith('image/')) {
                try {
                    const buffer = Buffer.from(media.data, 'base64');
                    const processedBuffer = await sharp(buffer)
                        .resize(512, 512, {
                            fit: 'contain',
                            background: { r: 0, g: 0, b: 0, alpha: 0 }
                        })
                        .webp()
                        .toBuffer();

                    processedMedia = new MessageMedia(
                        'image/webp',
                        processedBuffer.toString('base64'),
                        'sticker.webp'
                    );
                } catch (error) {
                    logger.error('Error processing image for sticker:', error);
                    return await message.reply(getText('sticker_error'));
                }
            }

            // Send as sticker
            await client.sendMessage(message.from, processedMedia, { sendMediaAsSticker: true });
            await message.reply(getText('sticker_created'));

        } catch (error) {
            logger.error('Error in sticker command:', error);
            await message.reply(getText('sticker_error'));
        }
    }
};