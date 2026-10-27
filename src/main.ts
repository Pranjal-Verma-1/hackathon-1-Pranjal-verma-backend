import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';
import {
  LISTEN_HOST,
  resolveAllowedOrigins,
  resolveListenPort,
} from './http-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({
    origin: resolveAllowedOrigins(process.env.FRONTEND_ORIGIN),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
  });
  await app.listen(resolveListenPort(process.env.PORT), LISTEN_HOST);
}
bootstrap();
