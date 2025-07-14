import youtubeDl from 'youtube-dl-exec';
import { MessageMedia } from 'whatsapp-web.js';
import fs from 'fs-extra';
import path from 'path';

export default {
    name: 'ytmp3',
    description: 'Download YouTube video as MP3 audio',
    usage: 'ytmp3 <youtube_url>',
    aliases: ['yt', 'youtube', 'ytaudio'],
    
    async execute(message, args, { client, config, getText, logger, fileHelper }) {
        try {
            if (args.length === 0) {
                return await message.reply(`Usage: ${config.PREFIX}ytmp3 <youtube_url>`);
            }

            const url = args[0];
            
            // Basic YouTube URL validation
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(url)) {
                return await message.reply(getText('youtube_invalid'));
            }

            await message.reply(getText('download_started'));

            // Generate unique filename
            const timestamp = Date.now();
            const outputPath = path.join(config.DOWNLOADS_PATH, `audio_${timestamp}`);
            const finalPath = `${outputPath}.mp3`;

            try {
                // Get video info first
                const info = await youtubeDl(url, {
                    dumpSingleJson: true,
                    noCheckCertificates: true,
                    noWarnings: true,
                    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
                });

                const title = info.title || 'Unknown Title';
                const duration = info.duration;

                // Check duration (limit to 10 minutes for demo)
                if (duration && duration > 600) {
                    return await message.reply('❌ Video is too long. Maximum duration allowed: 10 minutes.');
                }

                await message.reply(getText('youtube_downloading', { title }));

                // Download audio
                await youtubeDl(url, {
                    extractAudio: true,
                    audioFormat: 'mp3',
                    audioQuality: '192K',
                    output: `${outputPath}.%(ext)s`,
                    noCheckCertificates: true,
                    noWarnings: true,
                    addHeader: ['referer:youtube.com', 'user-agent:googlebot']
                });

                // Check if file exists
                if (await fs.pathExists(finalPath)) {
                    // Check file size (limit to 16MB for WhatsApp)
                    const stats = await fs.stat(finalPath);
                    const fileSizeInMB = stats.size / (1024 * 1024);

                    if (fileSizeInMB > 16) {
                        await fs.unlink(finalPath);
                        return await message.reply('❌ Audio file is too large for WhatsApp (>16MB).');
                    }

                    // Read file and send
                    const audioBuffer = await fs.readFile(finalPath);
                    const media = new MessageMedia(
                        'audio/mpeg',
                        audioBuffer.toString('base64'),
                        `${title.replace(/[^\w\s]/gi, '').substring(0, 50)}.mp3`
                    );

                    await client.sendMessage(message.from, media);
                    await message.reply(getText('youtube_completed'));

                    // Clean up file
                    await fs.unlink(finalPath);
                } else {
                    throw new Error('Downloaded file not found');
                }

            } catch (downloadError) {
                logger.error('YouTube download error:', downloadError);
                
                // Clean up any partial files
                try {
                    if (await fs.pathExists(finalPath)) {
                        await fs.unlink(finalPath);
                    }
                } catch (cleanupError) {
                    // Ignore cleanup errors
                }
                
                await message.reply(getText('youtube_error'));
            }

        } catch (error) {
            logger.error('Error in ytmp3 command:', error);
            await message.reply(getText('error_occurred'));
        }
    }
};