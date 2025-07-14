import fs from 'fs-extra';
import path from 'path';
import moment from 'moment';

class FileHelper {
    constructor() {
        this.dataPath = './data';
        this.downloadPath = './public/downloads';
    }

    async ensureDataFiles() {
        try {
            // Ensure directories exist
            await fs.ensureDir(this.dataPath);
            await fs.ensureDir(this.downloadPath);
            await fs.ensureDir('./session');
            await fs.ensureDir('./lang');

            // Ensure data files exist
            const usersFile = path.join(this.dataPath, 'users.json');
            if (!await fs.pathExists(usersFile)) {
                await fs.writeJson(usersFile, {}, { spaces: 2 });
            }

            const logsFile = path.join(this.dataPath, 'logs.json');
            if (!await fs.pathExists(logsFile)) {
                await fs.writeJson(logsFile, [], { spaces: 2 });
            }

        } catch (error) {
            throw new Error(`Failed to ensure data files: ${error.message}`);
        }
    }

    async saveFile(buffer, filename, directory = this.downloadPath) {
        try {
            await fs.ensureDir(directory);
            const filePath = path.join(directory, filename);
            await fs.writeFile(filePath, buffer);
            return filePath;
        } catch (error) {
            throw new Error(`Failed to save file: ${error.message}`);
        }
    }

    async deleteFile(filePath) {
        try {
            if (await fs.pathExists(filePath)) {
                await fs.unlink(filePath);
                return true;
            }
            return false;
        } catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }

    async readJsonFile(filePath, defaultValue = {}) {
        try {
            if (await fs.pathExists(filePath)) {
                return await fs.readJson(filePath);
            }
            return defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }

    async writeJsonFile(filePath, data) {
        try {
            await fs.ensureDir(path.dirname(filePath));
            await fs.writeJson(filePath, data, { spaces: 2 });
            return true;
        } catch (error) {
            throw new Error(`Failed to write JSON file: ${error.message}`);
        }
    }

    async cleanupOldFiles(directory = this.downloadPath, maxAgeHours = 24) {
        try {
            const files = await fs.readdir(directory);
            const now = moment();
            
            for (const file of files) {
                const filePath = path.join(directory, file);
                const stats = await fs.stat(filePath);
                const fileAge = now.diff(moment(stats.mtime), 'hours');
                
                if (fileAge > maxAgeHours) {
                    await this.deleteFile(filePath);
                }
            }
        } catch (error) {
            // Silently fail cleanup
        }
    }

    getFileExtension(filename) {
        return path.extname(filename).toLowerCase();
    }

    generateUniqueFilename(originalName) {
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const ext = this.getFileExtension(originalName);
        const name = path.basename(originalName, ext);
        return `${name}_${timestamp}${ext}`;
    }

    async getFileSize(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.size;
        } catch (error) {
            return 0;
        }
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

export default FileHelper;