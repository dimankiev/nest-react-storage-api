import { Inject, Injectable } from '@nestjs/common';
import { RedisRepository } from "./repositories";

@Injectable()
export class DbService {
    constructor(
        @Inject(RedisRepository) private readonly redisRepo: RedisRepository
    ) {}

    public async setShared(objectId: string, shared: boolean): Promise<void> {
        if (shared)
            await this.redisRepo.set('shared', objectId, '1');
        else
            await this.redisRepo.delete('shared', objectId);
    }

    public async getShared(objectId: string): Promise<boolean> {
        const result = await this.redisRepo.get('shared', objectId);
        return result === '1';
    }

    public async setSession(sessionId: string, sessionKey: string, ttl: number): Promise<void> {
        await this.redisRepo.set('session', sessionId, sessionKey, ttl);
    }

    public async getSession(sessionId: string): Promise<string> {
        return await this.redisRepo.get('session', sessionId);
    }

    public async revokeSession(sessionId: string): Promise<void> {
        await this.redisRepo.delete('session', sessionId);
    }
}
