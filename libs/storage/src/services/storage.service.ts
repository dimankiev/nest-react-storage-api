import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as crypto from 'crypto';
import { sanitize } from '../utils/sanitize';
import { Item } from '../interfaces/item';

@Injectable()
export class StorageService {
    private getUserPath(userId: string) {
        return path.join('storage', userId);
    }

    private getFilePath(
        userId: string,
        fileName: string,
        folders?: string[],
        privatePath = true
    ) {
        if (!!folders?.length)
            return path.join(
                this.getUserPath(userId),
                privatePath ? 'files' : 'shared',
                ...folders.map((f) => sanitize(f)),
                sanitize(fileName)
            );
        return path.join(this.getUserPath(userId), 'files', sanitize(fileName));
    }

    private getSharedPath(userId: string) {
        return path.join(this.getUserPath(userId), 'shared');
    }

    private async ensureDir(dirPath: string) {
        await fs.ensureDir(dirPath);
    }

    private hashName(name: string) {
        return crypto.createHash('sha256').update(name).digest('hex');
    }

    private async getSharedFilePath(
        userId: string,
        filePath: string
    ): Promise<string | null> {
        const sharedPath = this.getSharedPath(userId);
        const hash = this.hashName(filePath);
        const sharedFilePath = path.join(sharedPath, `${hash}.json`);
        return (await fs.pathExists(sharedFilePath)) ? sharedFilePath : null;
    }

    async listFiles(userId: string, folders?: string[]) {
        const filesPath = this.getFilePath(userId, '', folders);
        await this.ensureDir(filesPath);
        try {
            const items = await fs.readdir(filesPath);

            const statsPromises = items.map(async (item) => {
                const itemPath = path.join(filesPath, item);
                const itemStat = await fs.stat(itemPath);
                return {
                    name: item,
                    isDirectory: itemStat.isDirectory()
                };
            });

            return await Promise.all(statsPromises);
        } catch (error) {
            console.error('Error reading directory:', error);
            throw error;
        }
    }

    async isShared(
        userId: string,
        fileName: string,
        folders: string[]
    ): Promise<boolean> {
        const filePath = this.getFilePath(userId, fileName, folders);
        const sharedFilePath = await this.getSharedFilePath(userId, filePath);
        return sharedFilePath !== null;
    }

    async shareFile(userId: string, fileName: string, folders: string[]) {
        const filePath = this.getFilePath(userId, fileName, folders);
        if (!(await fs.pathExists(filePath))) {
            throw new NotFoundException('File not found');
        }
        const sharedPath = this.getSharedPath(userId);
        await this.ensureDir(sharedPath);
        const hash = this.hashName(filePath);
        const sharedFilePath = path.join(sharedPath, `${hash}.json`);

        let sharedInfo;
        if (await fs.pathExists(sharedFilePath)) {
            // If shared info already exists, read and return it
            sharedInfo = await fs.readJson(sharedFilePath);
        } else {
            // If shared info doesn't exist, create it
            sharedInfo = {
                originalName: fileName,
                path: filePath,
                sharedAt: new Date().toISOString()
            };
            await fs.writeJson(sharedFilePath, sharedInfo);
        }

        return { url: `/shared/${userId}/${hash}` };
    }

    async renameFile(
        userId: string,
        oldName: string,
        newName: string,
        folders: string[]
    ) {
        const oldFilePath = this.getFilePath(userId, oldName, folders);
        const newFilePath = this.getFilePath(userId, newName, folders);
        if (!(await fs.pathExists(oldFilePath))) {
            throw new NotFoundException('File not found');
        }

        // Check if the file is shared and delete the shared file first
        const sharedFilePath = await this.getSharedFilePath(
            userId,
            oldFilePath
        );
        if (sharedFilePath) {
            await fs.remove(sharedFilePath);
        }

        await fs.rename(oldFilePath, newFilePath);

        // If the file was shared, create a new shared file with updated information
        if (sharedFilePath) {
            const newHash = this.hashName(newFilePath);
            const newSharedFilePath = path.join(
                this.getSharedPath(userId),
                `${newHash}.json`
            );
            const sharedInfo = {
                originalName: newName,
                path: newFilePath,
                sharedAt: new Date().toISOString()
            };
            await fs.writeJson(newSharedFilePath, sharedInfo);
        }
    }

    async moveFile(
        userId: string,
        fileName: string,
        targetDir: string,
        folders?: string[]
    ) {
        const filePath = this.getFilePath(userId, fileName, folders);
        const targetPath = path.join(
            this.getFilePath(userId, targetDir, folders),
            fileName
        );
        if (!(await fs.pathExists(filePath))) {
            throw new NotFoundException('File not found');
        }

        // Check if the file is shared and delete the shared file first
        const sharedFilePath = await this.getSharedFilePath(userId, filePath);
        if (sharedFilePath) {
            await fs.remove(sharedFilePath);
        }

        await fs.move(filePath, targetPath);

        // If the file was shared, create a new shared file with updated information
        if (sharedFilePath) {
            const newHash = this.hashName(targetPath);
            const newSharedFilePath = path.join(
                this.getSharedPath(userId),
                `${newHash}.json`
            );
            const sharedInfo = {
                originalName: fileName,
                path: targetPath,
                sharedAt: new Date().toISOString()
            };
            await fs.writeJson(newSharedFilePath, sharedInfo);
        }
    }

    async deleteFile(
        userId: string,
        fileName: string,
        folders: string[]
    ): Promise<void> {
        const filePath = this.getFilePath(userId, fileName, folders);
        if (!(await fs.pathExists(filePath))) {
            throw new NotFoundException('File not found');
        }

        // Check if the file is shared and delete the shared file first
        const sharedFilePath = await this.getSharedFilePath(userId, filePath);
        if (sharedFilePath) {
            await fs.remove(sharedFilePath);
        }

        await fs.remove(filePath);
    }

    private async getUniqueFileName(
        basePath: string,
        originalName: string
    ): Promise<string> {
        let fileName = originalName;
        let counter = 1;
        while (await fs.pathExists(path.join(basePath, fileName))) {
            const ext = path.extname(originalName);
            const name = path.basename(originalName, ext);
            fileName = `${name} (${counter})${ext}`;
            counter++;
        }
        return fileName;
    }

    async createFolder(userId: string, folderName: string, folders: string[]) {
        const basePath = this.getFilePath(userId, '', folders);
        const uniqueFolderName = await this.getUniqueFileName(
            basePath,
            folderName
        );
        const folderPath = path.join(basePath, uniqueFolderName);
        await this.ensureDir(folderPath);
        return uniqueFolderName;
    }

    async uploadFiles(
        userId: string,
        files: Express.Multer.File[],
        folders: string[]
    ) {
        const uploadPath = this.getFilePath(userId, '', folders);
        await this.ensureDir(uploadPath);

        const uploadedFiles = [];
        for (const file of files) {
            const sanitizedFileName = sanitize(file.originalname);
            const uniqueFileName = await this.getUniqueFileName(
                uploadPath,
                sanitizedFileName
            );
            const filePath = path.join(uploadPath, uniqueFileName);
            await fs.writeFile(filePath, file.buffer);
            uploadedFiles.push(uniqueFileName);
        }
        return uploadedFiles;
    }

    async downloadFile(
        userId: string,
        fileName: string,
        folders: string[]
    ): Promise<Buffer> {
        const filePath = this.getFilePath(userId, fileName, folders);
        if (!(await fs.pathExists(filePath))) {
            throw new NotFoundException('File not found');
        }
        return fs.readFile(filePath);
    }

    async searchFiles(
        userId: string,
        searchTerm: string,
        currentPath: string[] = []
    ): Promise<string[]> {
        const basePath = this.getFilePath(userId, '', currentPath);
        return this.searchFilesRecursive(basePath, searchTerm);
    }

    private async searchFilesRecursive(
        dir: string,
        searchTerm: string
    ): Promise<string[]> {
        const files = await fs.readdir(dir);
        let results: string[] = [];

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                results = results.concat(
                    await this.searchFilesRecursive(filePath, searchTerm)
                );
            } else if (file.toLowerCase().includes(searchTerm.toLowerCase())) {
                results.push(filePath);
            }
        }

        return results;
    }

    async unshareFile(
        userId: string,
        fileName: string,
        folders: string[]
    ): Promise<void> {
        const filePath = this.getFilePath(userId, fileName, folders);
        const sharedFilePath = await this.getSharedFilePath(userId, filePath);

        if (!sharedFilePath) {
            throw new NotFoundException('Shared file not found');
        }

        await fs.remove(sharedFilePath);
    }

    async getSharedFileData(userId: string, fileHash: string) {
        const sharedPath = this.getSharedPath(userId);
        const sharedFilePath = path.join(sharedPath, `${fileHash}.json`);

        if (!(await fs.pathExists(sharedFilePath))) {
            throw new NotFoundException('Shared file data not found');
        }

        try {
            const sharedInfo = await fs.readJson(sharedFilePath);
            const stats = await fs.stat(sharedInfo.path);
            return {
                ...sharedInfo,
                isDirectory: stats.isDirectory()
            };
        } catch (error) {
            console.error('Error reading shared file data:', error);
            throw new Error('Unable to read shared file data');
        }
    }

    async getSharedFolderContents(
        userId: string,
        fileHash: string,
        folderPath: string[]
    ): Promise<Item[]> {
        const sharedFileData = await this.getSharedFileData(userId, fileHash);
        if (!sharedFileData.isDirectory) {
            throw new NotFoundException('Not a shared folder');
        }

        const fullPath = path.join(sharedFileData.path, ...folderPath);
        const contents = await fs.readdir(fullPath);

        return Promise.all(
            contents.map(async (item) => {
                const itemPath = path.join(fullPath, item);
                const stat = await fs.stat(itemPath);
                return {
                    name: item,
                    isDirectory: stat.isDirectory()
                };
            })
        );
    }
}
