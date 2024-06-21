import {Inject, Injectable} from '@nestjs/common';
import {DbService} from "@app/db";
import {AuthCryptoService} from "./auth-crypto.service";
import {ISession} from "../interfaces";
import {DEFAULT_SESSION_TTL} from "../const";

@Injectable()
export class AuthSessionService {
    constructor(
        @Inject(DbService) private readonly dbSvc: DbService,
        @Inject(AuthCryptoService) private readonly cryptoSvc: AuthCryptoService,
    ) {}

    public createJwt(session: ISession, userId: string, userKey: string): string {
        const derivedKey = this.cryptoSvc.deriveSharedSecret(session.key, userKey);

        const encrypted = this.cryptoSvc.encryptPayload({ uid: userId }, derivedKey);

        const jwtPayload = {
            sid: session.id,
            data: encrypted.data,
            v: encrypted.iv
        };

        return this.cryptoSvc.signJwt(jwtPayload);
    }

    public async createSession(ttl: number = DEFAULT_SESSION_TTL): Promise<ISession> {
        const id = this.cryptoSvc.generateSessionId();
        const keyPair = this.cryptoSvc.generateKeyPair();

        // await this.dbSvc.setSession(id, sessionKey, ttl);

        return { id, key: keyPair.privateKey };
    }

    public async revokeSession(sessionId: string): Promise<void> {
        await this.dbSvc.revokeSession(sessionId);
    }
}
