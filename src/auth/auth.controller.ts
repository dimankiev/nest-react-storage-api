import {Body, Controller, Inject, Post} from '@nestjs/common';
import {AuthService} from "@app/auth";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService
    ) {}
    @Post('/google/callback')
    async login(@Body('token') token: any, @Body('publicKey') publicKey: any): Promise<any> {
        return this.authService.authorizeWithGoogle(token, publicKey);
    }
}
