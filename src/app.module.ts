import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers';
import { AppService } from './services';
import { AuthModule } from '@app/auth';
import { StorageModule } from '@app/storage';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env'
        }),
        AuthModule,
        StorageModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
