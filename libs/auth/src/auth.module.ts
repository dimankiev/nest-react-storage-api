import { Module } from '@nestjs/common';
import { DbModule } from "@app/db";
import { AuthService, AuthCryptoService, AuthSessionService } from "./services";

@Module({
  imports: [
      DbModule,
  ],
  providers: [
      AuthService,
      AuthCryptoService,
      AuthSessionService,
  ],
  exports: [
      AuthService,
  ],
})
export class AuthModule {}
