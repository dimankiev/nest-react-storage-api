import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {deriveECDHSharedSecret, ECDHKeyPair, generateECDHKeyPair} from '../utils/ecdh-keypair';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

import { DEFAULT_SESSION_TTL } from "../const";
import {share} from "rxjs";

@Injectable()
export class AuthCryptoService {
    private readonly encryptionAlgorithm: string = 'aes-256-cbc';
    private readonly hashingAlgorithm: string = 'sha256';

    constructor() {}

    public hashString(input: string): string {
        return createHash(this.hashingAlgorithm).update(input).digest('hex');
    }

    public signJwt(payload: unknown): string {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: DEFAULT_SESSION_TTL, algorithm: 'RS256' });
    }

    public encryptPayload(payload: unknown, sharedSecret: string): { iv: string, data: string } {
        const iv = randomBytes(16);

        const cipher = createCipheriv(
            this.encryptionAlgorithm,
            Buffer.from(sharedSecret, 'hex'),
            iv
        );

        let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return { iv: iv.toString('hex'), data: encrypted };
    }

    public decryptPayload(payload: string, sharedSecret: string, iv: string): unknown {
        const decipher = createDecipheriv(this.encryptionAlgorithm, sharedSecret, iv);
        let decrypted = decipher.update(payload, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    }

    public deriveSharedSecret(privateKey: string, publicKey: string): string {
        const derivedSharedSecret = deriveECDHSharedSecret(privateKey, publicKey);
        // TODO: implement cryptographically stronger derivation
        return this.hashString(derivedSharedSecret);
    }

    public generateKeyPair(): ECDHKeyPair {
        return generateECDHKeyPair();
    }

    public generateSessionId(): string {
        return uuidv4();
    }
}
