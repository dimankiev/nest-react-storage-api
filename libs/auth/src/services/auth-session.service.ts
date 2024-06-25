import {Inject, Injectable} from '@nestjs/common';
import {DbService} from "@app/db";
import {AuthCryptoService} from "./auth-crypto.service";
import {ISession} from "../interfaces";
import {DEFAULT_SESSION_TTL} from "../const";
import {JwtPayload} from "jsonwebtoken";

@Injectable()
export class AuthSessionService {
    constructor(
        @Inject(DbService) private readonly dbSvc: DbService,
        @Inject(AuthCryptoService) private readonly cryptoSvc: AuthCryptoService,
    ) {}

    public createJwt(session: ISession, userId: string, userKey: string): string {
        const derivedKey = this.cryptoSvc.deriveSharedSecret(session.key, userKey);

        const encrypted =
            this.cryptoSvc.encryptPayload(
                {
                    uid: this.cryptoSvc.hashString(userId)
                },
                derivedKey
            );

        const jwtPayload = {
            sid: session.id,
            data: encrypted.data,
            k: userKey,
            v: encrypted.iv
        };

        return this.cryptoSvc.signJwt(jwtPayload);
    }

    public async createSession(ttl: number = DEFAULT_SESSION_TTL): Promise<ISession> {
        const id = this.cryptoSvc.generateSessionId();
        const keyPair = this.cryptoSvc.generateKeyPair();

        await this.dbSvc.setSession(id, keyPair.privateKey, ttl);

        return { id, key: keyPair.privateKey };
    }

    public async revokeSession(sessionId: string): Promise<void> {
        await this.dbSvc.revokeSession(sessionId);
    }

    /**
     * Decode JWT, get session ID, retrieve session key from DB, decrypt JWT payload and return ID from it
     * @param jwt
     */
    public async validate(jwt: string): Promise<string> {
        const payload = this.cryptoSvc.verifyAndDecodeJwt(jwt) as JwtPayload;

        const sessionKey = await this.dbSvc.getSession(payload.sid);

        const decrypted: { uid: string } =
            this.cryptoSvc.decryptPayload(
                payload.data,
                this.cryptoSvc.deriveSharedSecret(sessionKey, payload.k),
                payload.v
            ) as { uid: string };

        return decrypted.uid;
    }
}
