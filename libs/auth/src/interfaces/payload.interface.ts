export interface ITokenDataPayload {
    // User ID (SHA 256 hash)
    uid: string;
}

export interface ITokenPayload {
    // Session ID
    sid: string;

    // Encrypted payload
    data: string;

    // User public key
    k: string;

    // Initialization vector
    v: string;
}