import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

@Injectable()
export class SessionGuard implements CanActivate {
    canActivate(context: ExecutionContext): Observable<boolean> {
        return of(true);
    }
}
