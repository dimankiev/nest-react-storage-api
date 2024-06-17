import { generateKeyPair } from 'crypto';
import { promisify } from 'util'

const gen = promisify(generateKeyPair);

export interface RSAKeyPair {
    publicKey: string;
    privateKey: string;
}

export function generateRSAKeyPair(): Promise<RSAKeyPair>
{
    return gen('rsa', {
        modulusLength: 1024,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });
}