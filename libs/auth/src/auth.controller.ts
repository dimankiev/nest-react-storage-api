import { Body, Controller, Inject, Post } from '@nestjs/common';
import { AuthService } from "./services";
import { IAuthResponse } from "./interfaces";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService
    ) {}

    @Post('/google/callback')
    async login(@Body('token') token: any, @Body('publicKey') publicKey: any): Promise<IAuthResponse> {
        // TODO: think of other ways returning JWT
        return await this.authService.authorizeWithGoogle(token, publicKey);
    }
}
