import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    Res
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { Request } from 'express';
import { SessionGuard } from '@app/auth/guards';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('files')
@UseGuards(SessionGuard)
export class StorageController {
    constructor(private readonly storageService: StorageService) {}

    @Post('list')
    async listFiles(@Req() req: Request, @Body() body: { path: string[] }) {
        const userId = req['userId'];
        return this.storageService.listFiles(userId, body.path);
    }

    @Post('search')
    async searchFiles(
        @Req() req: Request,
        @Body() body: { searchTerm: string; path: string[] }
    ) {
        const userId = req['userId'];
        return this.storageService.searchFiles(
            userId,
            body.searchTerm,
            body.path
        );
    }

    @Post('unshare')
    async unshareFile(
        @Req() req: Request,
        @Body() body: { fileName: string; path: string[] }
    ) {
        const userId = req['userId'];
        await this.storageService.unshareFile(userId, body.fileName, body.path);
        return { message: 'File unshared successfully' };
    }

    @Post('isShared')
    async isShared(
        @Req() req: Request,
        @Body() body: { fileName: string; path: string[] }
    ) {
        const userId = req['userId'];
        const isShared = await this.storageService.isShared(
            userId,
            body.fileName,
            body.path
        );
        return { isShared };
    }

    @Post('share')
    async shareFile(
        @Req() req: Request,
        @Body() body: { fileName: string; path: string[] }
    ) {
        const userId = req['userId'];
        return this.storageService.shareFile(userId, body.fileName, body.path);
    }

    @Post('create')
    async createFolder(
        @Req() req: Request,
        @Body() body: { folderName: string; path: string[] }
    ) {
        const userId = req['userId'];
        await this.storageService.createFolder(
            userId,
            body.folderName,
            body.path
        );
        return { message: 'Folder created successfully' };
    }

    @Post('upload')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFiles(
        @Req() req: Request,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: { path: string }
    ) {
        const userId = req['userId'];
        const uploadedFiles = await this.storageService.uploadFiles(
            userId,
            files,
            JSON.parse(body.path) as unknown as string[]
        );
        return { message: 'Files uploaded successfully', files: uploadedFiles };
    }

    @Post('download')
    async downloadFile(
        @Req() req: Request,
        @Body() body: { fileName: string; path: string[] },
        @Res() res: Response
    ) {
        const userId = req['userId'];
        const fileBuffer = await this.storageService.downloadFile(
            userId,
            body.fileName,
            body.path
        );
        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${body.fileName}"`
        });
        res.send(fileBuffer);
    }

    @Post('rename')
    async renameFile(
        @Req() req: Request,
        @Body() body: { oldName: string; newName: string; path: string[] }
    ) {
        const userId = req['userId'];
        return this.storageService.renameFile(
            userId,
            body.oldName,
            body.newName,
            body.path
        );
    }

    @Post('move')
    async moveFile(
        @Req() req: Request,
        @Body() body: { fileName: string; targetDir: string; path: string[] }
    ) {
        const userId = req['userId'];
        return this.storageService.moveFile(
            userId,
            body.fileName,
            body.targetDir,
            body.path
        );
    }

    @Post('delete')
    async deleteFile(
        @Req() req: Request,
        @Body() body: { fileName: string; path: string[] }
    ) {
        const userId = req['userId'];
        return this.storageService.deleteFile(userId, body.fileName, body.path);
    }
}
