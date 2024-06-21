import * as utils from '@noble/curves/abstract/utils';
import { secp521r1 } from "@noble/curves/p521";

export interface ECDHKeyPair {
    publicKey: string;
    privateKey: string;
}

export function generateECDHKeyPair(): ECDHKeyPair {
    const privateKey = secp521r1.utils.randomPrivateKey();
    const publicKey = secp521r1.getPublicKey(privateKey);

    return {
        privateKey: utils.bytesToHex(privateKey),
        publicKey: utils.bytesToHex(publicKey)
    }
}

export function getPublicECDHKey(privateKey: string): string {
    const publicKey = secp521r1
        .getPublicKey(
            utils.hexToBytes(privateKey)
        );

    return utils.bytesToHex(publicKey);
}

export function deriveECDHSharedSecret(privateKey: string, publicKey: string): string {
    const shared = secp521r1.getSharedSecret(
        utils.hexToBytes(privateKey),
        utils.hexToBytes(publicKey)
    );
    return utils.bytesToHex(shared);
}