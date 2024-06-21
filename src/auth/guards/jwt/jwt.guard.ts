import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class JwtGuard implements CanActivate {
    canActivate(context: ExecutionContext): Observable<boolean> {
        return of(true);
    }
}
