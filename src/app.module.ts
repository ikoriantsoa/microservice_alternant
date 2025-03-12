import { Module } from '@nestjs/common';
import { CryptageModule } from './cryptage/cryptage.module';
import { NextcloudModule } from './nextcloud/nextcloud.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebinaireModule } from './webinaire/webinaire.module';
import { WebinaireAlternantEntity } from './webinaire/entity/webinaire.entity';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  }), 
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    entities: [WebinaireAlternantEntity],
    synchronize: true,
  }), CryptageModule, NextcloudModule, WebinaireModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
