import { Module } from '@nestjs/common';
import { DbModule } from "@app/db";
import { AuthService, AuthCryptoService, AuthSessionService } from "./services";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        DbModule,
    ],
    providers: [
        AuthService,
        AuthCryptoService,
        AuthSessionService,
    ],
    controllers: [
        AuthController,
    ],
    exports: [
        AuthService,
    ],
})
export class AuthModule {}
