import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import moment from 'moment';

// Utils
import Logger from './irfan/utils/logger.js';
import FileHelper from './irfan/utils/fileHelper.js';

// Middlewares
import isAdmin from './irfan/middlewares/isAdmin.js';
import floodControl from './irfan/middlewares/floodControl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WhatsAppBot {
    constructor() {
        this.config = {};
        this.commands = {
            users: new Map(),
            admins: new Map()
        };
        this.languages = {};
        this.client = null;
        this.logger = new Logger();
        this.fileHelper = new FileHelper();
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
            await this.loadLanguages();
            await this.loadCommands();
            await this.initializeClient();
        } catch (error) {
            this.logger.error('Failed to initialize bot:', error);
            process.exit(1);
        }
    }

    async loadConfig() {
        try {
            this.config = await fs.readJson('./config.json');
            this.logger.info(`Bot initialized for number: ${chalk.green(this.config.BOT_NUMBER)}`);
            this.logger.info(`Owner: ${chalk.yellow(this.config.OWNER_NUMBER)}`);
            this.logger.info(`Prefix: ${chalk.cyan(this.config.PREFIX)}`);
            this.logger.info(`Language: ${chalk.magenta(this.config.LANGUAGE)}`);
        } catch (error) {
            this.logger.error('Failed to load config.json:', error);
            throw error;
        }
    }

    async loadLanguages() {
        try {
            const langDir = './lang';
            const langFiles = await fs.readdir(langDir);
            
            for (const file of langFiles) {
                if (file.endsWith('.json')) {
                    const lang = file.replace('.json', '');
                    this.languages[lang] = await fs.readJson(path.join(langDir, file));
                }
            }
            this.logger.success(`Loaded ${Object.keys(this.languages).length} language(s)`);
        } catch (error) {
            this.logger.error('Failed to load languages:', error);
            throw error;
        }
    }

    async loadCommands() {
        try {
            // Load user commands
            const userCommandsDir = './irfan/commands/users';
            const userFiles = await fs.readdir(userCommandsDir);
            
            for (const file of userFiles) {
                if (file.endsWith('.js')) {
                    const commandName = file.replace('.js', '');
                    const commandModule = await import(path.join(process.cwd(), userCommandsDir, file));
                    this.commands.users.set(commandName, commandModule.default);
                }
            }

            // Load admin commands
            const adminCommandsDir = './irfan/commands/admins';
            const adminFiles = await fs.readdir(adminCommandsDir);
            
            for (const file of adminFiles) {
                if (file.endsWith('.js')) {
                    const commandName = file.replace('.js', '');
                    const commandModule = await import(path.join(process.cwd(), adminCommandsDir, file));
                    this.commands.admins.set(commandName, commandModule.default);
                }
            }

            this.logger.success(`Loaded ${this.commands.users.size} user command(s)`);
            this.logger.success(`Loaded ${this.commands.admins.size} admin command(s)`);
        } catch (error) {
            this.logger.error('Failed to load commands:', error);
            throw error;
        }
    }

    async initializeClient() {
        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: this.config.SESSION_PATH
                }),
                puppeteer: {
                    headless: this.config.HEADLESS,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu'
                    ]
                }
            });

            this.setupEventHandlers();
            await this.client.initialize();
        } catch (error) {
            this.logger.error('Failed to initialize WhatsApp client:', error);
            throw error;
        }
    }

    setupEventHandlers() {
        this.client.on('loading_screen', (percent, message) => {
            this.logger.info(`Loading: ${percent}% - ${message}`);
        });

        this.client.on('qr', (qr) => {
            this.logger.info('QR Code received! Scan it with WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('authenticated', () => {
            this.logger.success('Authentication successful!');
        });

        this.client.on('auth_failure', (msg) => {
            this.logger.error('Authentication failed:', msg);
        });

        this.client.on('ready', async () => {
            this.logger.success(`WhatsApp Bot is ready! 🚀`);
            this.logger.info(`Bot Number: ${chalk.green(this.config.BOT_NUMBER)}`);
            
            // Ensure data files exist
            await this.fileHelper.ensureDataFiles();
        });

        this.client.on('message_create', async (message) => {
            await this.handleMessage(message);
        });

        this.client.on('disconnected', (reason) => {
            this.logger.warn('Client was logged out:', reason);
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            this.logger.info('Shutting down gracefully...');
            await this.client.destroy();
            process.exit(0);
        });
    }

    async handleMessage(message) {
        try {
            // Ignore messages from status broadcasts
            if (message.from === 'status@broadcast') return;
            
            // Only process text messages that start with prefix
            if (message.type !== 'chat' || !message.body.startsWith(this.config.PREFIX)) return;

            const contact = await message.getContact();
            const chat = await message.getChat();
            
            // Parse command
            const args = message.body.slice(this.config.PREFIX.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Check flood control
            if (!await floodControl(message.from, this.config.MAX_COMMANDS_PER_MINUTE)) {
                return await message.reply(this.getText('flood_control'));
            }

            // Log command usage
            await this.logCommand(contact, commandName, args);

            // Save user data
            await this.saveUserData(contact);

            // Check if it's an admin command
            if (this.commands.admins.has(commandName)) {
                if (!await isAdmin(message.from, this.config)) {
                    return await message.reply(this.getText('admin_only'));
                }
                
                const command = this.commands.admins.get(commandName);
                await command.execute(message, args, {
                    client: this.client,
                    config: this.config,
                    getText: this.getText.bind(this),
                    logger: this.logger,
                    fileHelper: this.fileHelper
                });
            } 
            // Check if it's a user command
            else if (this.commands.users.has(commandName)) {
                const command = this.commands.users.get(commandName);
                await command.execute(message, args, {
                    client: this.client,
                    config: this.config,
                    getText: this.getText.bind(this),
                    logger: this.logger,
                    fileHelper: this.fileHelper
                });
            } 
            // Command not found
            else {
                await message.reply(this.getText('command_not_found'));
            }

        } catch (error) {
            this.logger.error('Error handling message:', error);
            try {
                await message.reply(this.getText('error_occurred'));
            } catch (replyError) {
                this.logger.error('Failed to send error message:', replyError);
            }
        }
    }

    getText(key, replacements = {}) {
        try {
            const lang = this.languages[this.config.LANGUAGE] || this.languages['en'];
            let text = lang[key] || this.languages['en'][key] || key;
            
            // Replace placeholders
            Object.keys(replacements).forEach(placeholder => {
                text = text.replace(`{${placeholder}}`, replacements[placeholder]);
            });
            
            return text;
        } catch (error) {
            this.logger.error('Error getting text:', error);
            return key;
        }
    }

    async logCommand(contact, command, args) {
        try {
            const logEntry = {
                timestamp: moment().toISOString(),
                user: contact.number,
                username: contact.name || contact.pushname || 'Unknown',
                command: command,
                args: args,
                date: moment().format('YYYY-MM-DD HH:mm:ss')
            };

            const logsPath = './data/logs.json';
            let logs = [];
            
            if (await fs.pathExists(logsPath)) {
                logs = await fs.readJson(logsPath);
            }
            
            logs.push(logEntry);
            
            // Keep only last 1000 logs
            if (logs.length > 1000) {
                logs = logs.slice(-1000);
            }
            
            await fs.writeJson(logsPath, logs, { spaces: 2 });
        } catch (error) {
            this.logger.error('Failed to log command:', error);
        }
    }

    async saveUserData(contact) {
        try {
            const usersPath = './data/users.json';
            let users = {};
            
            if (await fs.pathExists(usersPath)) {
                users = await fs.readJson(usersPath);
            }
            
            users[contact.number] = {
                name: contact.name || contact.pushname || 'Unknown',
                number: contact.number,
                firstSeen: users[contact.number]?.firstSeen || moment().toISOString(),
                lastSeen: moment().toISOString(),
                commandCount: (users[contact.number]?.commandCount || 0) + 1
            };
            
            await fs.writeJson(usersPath, users, { spaces: 2 });
        } catch (error) {
            this.logger.error('Failed to save user data:', error);
        }
    }
}

// Start the bot
const bot = new WhatsAppBot();