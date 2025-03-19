import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app: INestMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: process.env.MICROSERVICE_HOST,
      port: Number(process.env.MICROSERVICE_PORT),
    },
  });

  const logger = new LoggerService();
  app.useLogger(logger);
}
bootstrap();