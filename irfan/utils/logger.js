import chalk from 'chalk';
import moment from 'moment';

class Logger {
    constructor() {
        this.colors = {
            info: chalk.blue,
            success: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
            debug: chalk.gray
        };
    }

    formatTime() {
        return chalk.gray(`[${moment().format('HH:mm:ss')}]`);
    }

    info(message, ...args) {
        console.log(`${this.formatTime()} ${this.colors.info('ℹ')} ${message}`, ...args);
    }

    success(message, ...args) {
        console.log(`${this.formatTime()} ${this.colors.success('✓')} ${message}`, ...args);
    }

    warn(message, ...args) {
        console.log(`${this.formatTime()} ${this.colors.warn('⚠')} ${message}`, ...args);
    }

    error(message, ...args) {
        console.log(`${this.formatTime()} ${this.colors.error('✗')} ${message}`, ...args);
    }

    debug(message, ...args) {
        console.log(`${this.formatTime()} ${this.colors.debug('⚡')} ${message}`, ...args);
    }

    log(level, message, ...args) {
        switch (level.toLowerCase()) {
            case 'info':
                this.info(message, ...args);
                break;
            case 'success':
                this.success(message, ...args);
                break;
            case 'warn':
            case 'warning':
                this.warn(message, ...args);
                break;
            case 'error':
                this.error(message, ...args);
                break;
            case 'debug':
                this.debug(message, ...args);
                break;
            default:
                this.info(message, ...args);
        }
    }
}

export default Logger;