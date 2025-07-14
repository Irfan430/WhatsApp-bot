# 🤖 Advanced WhatsApp Bot

A production-grade, modular WhatsApp bot built with Node.js and whatsapp-web.js. Features include auto-command loading, multi-language support, admin controls, flood protection, and much more.

## ✨ Features

- 🔧 **Modular Architecture**: Auto-loading commands from organized folders
- 👑 **Admin System**: Owner/admin role-based command access
- 🌍 **Multi-language Support**: English, Bengali, Hindi (easily extensible)
- 🛡️ **Flood Protection**: Anti-spam rate limiting
- 📊 **User Management**: Automatic user database and command logging  
- 🖼️ **Media Processing**: Sticker creation from images/videos
- 🎵 **YouTube Downloader**: Download YouTube audio as MP3
- 📡 **Broadcast System**: Send messages to all users
- 💾 **Session Persistence**: No need to scan QR code every restart
- 🔄 **Graceful Error Handling**: Never crashes, always recovers
- 📱 **Headless Support**: Perfect for Ubuntu VPS/servers

## 📁 Folder Structure

```
├── index.js                    # Main bot entry point
├── package.json               # Dependencies and scripts
├── config.json               # Bot configuration
├── .env.example              # Environment variables template
├── irfan/                    # Core bot modules
│   ├── commands/
│   │   ├── users/           # User commands (auto-loaded)
│   │   │   ├── menu.js
│   │   │   ├── sticker.js
│   │   │   ├── ytmp3.js
│   │   │   ├── ping.js
│   │   │   └── stats.js
│   │   └── admins/          # Admin-only commands (auto-loaded)
│   │       ├── broadcast.js
│   │       └── shutdown.js
│   ├── middlewares/
│   │   ├── isAdmin.js       # Admin verification
│   │   └── floodControl.js  # Anti-spam protection
│   └── utils/
│       ├── logger.js        # Colored console logging
│       └── fileHelper.js    # File operations
├── session/                 # WhatsApp session data
├── data/                   # User data and logs
│   ├── users.json          # User database
│   └── logs.json           # Command usage logs
├── lang/                   # Multi-language support
│   ├── en.json            # English
│   ├── bn.json            # Bengali
│   └── hi.json            # Hindi
└── public/
    └── downloads/          # Temporary downloads
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Ubuntu/Linux VPS (recommended)

### Installation

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd advanced-whatsapp-bot
   npm install
   ```

2. **Configure the bot:**
   ```bash
   # Edit config.json with your settings
   nano config.json
   ```

   Update these values:
   ```json
   {
     "BOT_NUMBER": "+8801780000000",      # Your WhatsApp number
     "OWNER_NUMBER": "1234567890@s.whatsapp.net",  # Your WhatsApp ID
     "ADMINS": ["1234567890@s.whatsapp.net"],       # Admin WhatsApp IDs
     "PREFIX": "!",                       # Command prefix
     "LANGUAGE": "en"                     # Language (en/bn/hi)
   }
   ```

3. **Start the bot:**
   ```bash
   npm start
   ```

### 📱 Pairing Device (First Time)

1. Run the bot: `npm start`
2. Look for the **6-digit pairing code** in console output
3. On your WhatsApp mobile:
   - Go to **Settings** → **Linked Devices**
   - Tap **"Link a Device"**
   - Tap **"Link with phone number instead"**
   - Enter the 6-digit code shown in console
4. ✅ Done! Bot is now linked and ready

### 🔧 Ubuntu/VPS Setup

For headless Ubuntu servers:

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install dependencies for puppeteer
sudo apt-get install -y gconf-service libasound2 libatk1.0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# Install FFmpeg for media processing
sudo apt-get install -y ffmpeg

# Clone and setup bot
git clone <repository-url>
cd advanced-whatsapp-bot
npm install
npm start
```

## 📋 Available Commands

### 👤 User Commands
- `!menu` - Show all available commands
- `!sticker` - Convert image/video to sticker (reply to media)
- `!ytmp3 <url>` - Download YouTube audio as MP3
- `!ping` - Check bot response time
- `!stats` - Show bot statistics

### 👑 Admin Commands  
- `!broadcast <message>` - Send message to all users
- `!shutdown` - Gracefully shutdown the bot

## 🎯 Adding New Commands

### User Commands
1. Create a new `.js` file in `irfan/commands/users/`
2. Use this template:

```javascript
export default {
    name: 'commandname',
    description: 'Command description',
    usage: 'commandname <args>',
    aliases: ['alias1', 'alias2'],
    
    async execute(message, args, { client, config, getText, logger, fileHelper }) {
        try {
            // Your command logic here
            await message.reply('Hello World!');
        } catch (error) {
            logger.error('Error in command:', error);
            await message.reply(getText('error_occurred'));
        }
    }
};
```

### Admin Commands
1. Create a new `.js` file in `irfan/commands/admins/`
2. Add `adminOnly: true` property
3. Commands are automatically restricted to admins/owner

### 🌍 Language Support

Add new languages by creating `.json` files in the `lang/` folder:

```json
{
  "welcome": "Welcome message in your language",
  "command_not_found": "Command not found message",
  ...
}
```

Update `config.json` to use your language:
```json
{
  "LANGUAGE": "your_language_code"
}
```

## ⚙️ Configuration Options

### config.json
```json
{
  "BOT_NUMBER": "+8801780000000",           # Your WhatsApp number (displayed at startup)
  "OWNER_NUMBER": "1234567890@s.whatsapp.net",  # Owner WhatsApp ID
  "ADMINS": ["1234567890@s.whatsapp.net"],       # Array of admin WhatsApp IDs
  "PREFIX": "!",                           # Command prefix
  "LANGUAGE": "en",                        # Language code (en/bn/hi)
  "BOT_NAME": "Advanced WhatsApp Bot",     # Bot display name
  "BOT_VERSION": "1.0.0",                 # Version number
  "MAX_COMMANDS_PER_MINUTE": 10,          # Rate limit per user
  "SESSION_PATH": "./session",             # Session storage path
  "DOWNLOADS_PATH": "./public/downloads",  # Download directory
  "HEADLESS": true,                       # Run browser in headless mode
  "DEBUG": false                          # Enable debug logging
}
```

## 🛠️ Scripts

```bash
npm start          # Start the bot
npm run dev        # Start with auto-restart on changes  
npm run clean      # Clean session and downloads
```

## 📝 Logs

- **Command Logs**: Stored in `data/logs.json`
- **User Database**: Stored in `data/users.json`
- **Console Logs**: Colored output with timestamps

## 🔒 Security Features

- Admin-only command protection
- Rate limiting to prevent spam
- Input validation and sanitization
- Graceful error handling
- Session encryption

## 🚨 Troubleshooting

### Common Issues

1. **"Session not found"**
   - Delete `session/` folder and restart
   - Re-pair the device

2. **"Commands not loading"**
   - Check file permissions
   - Ensure `.js` files have proper export syntax

3. **"YouTube download failed"**
   - Install `youtube-dl` or `yt-dlp`
   - Check internet connection
   - Verify FFmpeg installation

4. **"Puppeteer launch failed"**
   - Install required dependencies (see Ubuntu setup)
   - Set `HEADLESS: true` in config

### Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify your `config.json` settings
3. Ensure all dependencies are installed
4. Test with a simple command like `!ping`

## 🔄 Updates

To update the bot:
```bash
git pull origin main
npm install  # Install any new dependencies
npm start
```

## 📄 License

MIT License - feel free to modify and distribute.

## 🙏 Credits

Built with:
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [puppeteer](https://github.com/puppeteer/puppeteer)
- [youtube-dl-exec](https://github.com/microlinkhq/youtube-dl-exec)

---

### 🎉 Ready to use! Your advanced WhatsApp bot is now plug & play.

**Tip**: The bot displays your `BOT_NUMBER` at startup so you always know which WhatsApp account is connected.