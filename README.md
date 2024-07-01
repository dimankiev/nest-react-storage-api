# NestJS + React File Storage

## Description

Back-End for File Storage that utilizes ECC, ECDH and AES-256 for session management (no storing PII)

```mermaid
sequenceDiagram
    participant FE as Front-end
    participant BE as Back-end
    participant Redis
    participant Google as Google OAuth2

    Note over FE: Generate ECDH secp521r1 ECC key pair
    Note over BE: Generate 2048bit RSA key pair for JWT (per deploy)

    FE->>Google: Sign in with Google
    Google-->>FE: OAuth2 Credential Token

    FE->>BE: Send { token, publicKey }
    BE->>Google: Verify OAuth2 Token
    Google-->>BE: Token verification result

    alt Token verification successful
        Note over BE: Generate secp521r1 ECC private key
        BE->>Redis: Create session (uuid v4 id, ECC private key)
        Redis-->>BE: Session created
        
        Note over BE: Derive shared secret using ECDH
        Note over BE: Encrypt payload with AES-256
        Note over BE: Create JWT payload: { sid, data (encrypted), k (user pubkey), v (IV) }

        BE-->>FE: Send JWT

        Note over FE: Store JWT for future requests

        loop For each authenticated action
            FE->>BE: Send request with Bearer: JWT
            Note over BE: Verify JWT
            BE->>Redis: Get session private key using sid
            Redis-->>BE: Session private key
            Note over BE: Derive shared secret using ECDH
            Note over BE: Decrypt data payload
            Note over BE: Use decrypted uid (User ID) for file operations
            BE-->>FE: Response
        end
    else Token verification failed
        BE-->>FE: Authentication failed
    end
```

## Installation

```bash
$ yarn install
```

## Running the app

Before starting the app
```bash
# precompile scripts, run before building app
$ yarn run prebuild
```

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Stay in touch

- Author - [dimankiev](https://github.com/dimankiev)

## License

This project is **UNLICENSED**.
