import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, of } from 'rxjs';

@Injectable()
export class GoogleGuard extends AuthGuard('google') implements CanActivate {
    canActivate(context: ExecutionContext): Observable<boolean> {
        return of(true);
    }
}
