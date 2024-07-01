import {
    Controller,
    Get,
    Param,
    Res,
    NotFoundException,
    StreamableFile,
    Query
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { sanitize } from '../utils/sanitize';
import { Response } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';

@Controller('shared')
export class SharedStorageController {
    constructor(private readonly storageService: StorageService) {}

    @Get(':userId/:fileHash')
    async getSharedFileInfo(
        @Param('userId') userId: string,
        @Param('fileHash') fileHash: string,
        @Query('path') queryPath: string
    ) {
        try {
            const sharedFileData = await this.storageService.getSharedFileData(
                userId,
                fileHash
            );
            const folderPath = queryPath ? queryPath.split('/') : [];

            // Base information
            const response = {
                originalName: sharedFileData.originalName,
                sharedAt: sharedFileData.sharedAt,
                isDirectory: sharedFileData.isDirectory
            };

            // If it's a directory, include its contents
            if (sharedFileData.isDirectory) {
                const contents =
                    await this.storageService.getSharedFolderContents(
                        userId,
                        fileHash,
                        folderPath
                    );
                return { ...response, contents };
            }

            return response;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('Shared file or folder not found');
            }
            throw error;
        }
    }

    @Get(':userId/:fileHash/download')
    async downloadSharedFile(
        @Param('userId') userId: string,
        @Param('fileHash') fileHash: string,
        @Query('path') queryPath: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<StreamableFile> {
        try {
            const data = await this.storageService.getSharedFileData(
                userId,
                fileHash
            );

            const filePath = data.isDirectory
                ? path.join(data.path, sanitize(queryPath))
                : data.path;

            if (!(await fs.pathExists(filePath))) {
                throw new NotFoundException('File not found');
            }

            const file = fs.createReadStream(filePath);
            const fileName = path.basename(filePath);
            res.set({
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${fileName}"`
            });

            return new StreamableFile(file);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('Shared file not found');
            }
            throw error;
        }
    }
}
