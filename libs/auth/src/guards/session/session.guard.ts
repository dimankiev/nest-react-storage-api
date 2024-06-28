import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { AuthService } from '@app/auth';

@Injectable()
export class SessionGuard implements CanActivate {
    constructor(@Inject(AuthService) private readonly authSvc: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const token = this.getToken(request);
            request['userId'] = await this.authSvc.validateSession(token);
            return true;
        } catch (error) {
            console.log('auth error - ', error.message);
            throw new UnauthorizedException();
        }
    }

    private getToken(request: any): string {
        const { authorization }: any = request.headers;
        if (!authorization || authorization.trim() === '') {
            throw new UnauthorizedException('Not Authorized');
        }
        return authorization.replace(/bearer/gim, '').trim();
    }
}
