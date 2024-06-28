import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';
import { StorageController } from '@app/storage/controllers/storage.controller';
import { AuthModule } from '@app/auth';
import { SharedStorageController } from './controllers/shared-storage.controller';

@Module({
    imports: [AuthModule],
    providers: [StorageService],
    exports: [StorageService],
    controllers: [StorageController, SharedStorageController]
})
export class StorageModule {}
