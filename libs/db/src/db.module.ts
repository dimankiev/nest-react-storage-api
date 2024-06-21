import { Module } from '@nestjs/common';
import { DbService } from './db.service';
import { RedisRepository } from './repositories';
import {redisClientFactory} from "@app/db/providers";

@Module({
  providers: [
      DbService,
      RedisRepository,
      redisClientFactory
  ],
  exports: [
      DbService
  ],
})
export class DbModule {}
