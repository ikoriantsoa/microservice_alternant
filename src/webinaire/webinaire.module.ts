import { Module } from '@nestjs/common';
import { WebinaireController } from './webinaire.controller';
import { WebinaireService } from './webinaire.service';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { NextcloudService } from 'src/nextcloud/nextcloud.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebinaireAlternantEntity } from './entity/webinaire.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebinaireAlternantEntity])],
  controllers: [WebinaireController],
  providers: [WebinaireService, CryptageService, NextcloudService],
})
export class WebinaireModule {}
