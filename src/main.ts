import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from "node:fs";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // set jwt secret to environment variable
  process.env.JWT_SECRET = fs.readFileSync('keys/private.pem').toString();

  app.setGlobalPrefix('api');
  await app.listen(3000);
}

bootstrap();
