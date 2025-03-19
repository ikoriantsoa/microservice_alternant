import { BadRequestException, Body, Controller } from '@nestjs/common';
import { WebinaireService } from './webinaire.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NextcloudService } from 'src/nextcloud/nextcloud.service';
import { TCreateWebinaire } from './entity/ICreateWebinaire';
import { LoggerService } from 'src/logger/logger.service';

@Controller()
export class WebinaireController {
  constructor(
    private readonly webinaireService: WebinaireService,
    private readonly nextcloudService: NextcloudService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(WebinaireController.name);
  }

  @MessagePattern('createWebinaireAlternant')
  public async createWebinaire(@Payload() dataInfoWebinaire: TCreateWebinaire) {
    this.logger.log(`Méthode pour la création d'un webinaire alternant`)
    const { image, source } = dataInfoWebinaire;

    if (!image || !source) {
      throw new BadRequestException('Les fichiers image et souce sont requis.');
    }

    const imageFilePath = `/talentup/alternants/images/${Date.now()}-${image.originalname}`;
    const sourceFilePath = `/talentup/alternants/sources/${Date.now()}-${source.originalname}`;

    const imageUrl = await this.nextcloudService.uploadFile(
      imageFilePath,
      image.buffer,
    );

    const sourceUrl = await this.nextcloudService.uploadFile(
      sourceFilePath,
      source.buffer,
    );

    const dataWebinaire = {
      ...dataInfoWebinaire,
      image: imageUrl,
      source: sourceUrl,
    };
    this.logger.log(`Récupération des données à envoyer au service`)
    return this.webinaireService.createWebinaire(dataWebinaire);
  }

  @MessagePattern('getAllWebinaireAlternant')
  public getWebinaireByKeycloakId(keycloak_id: string) {
    this.logger.log(`Méthode pour prendre l'id de keycloak`)
    return this.webinaireService.getAllWebinaireByKeycloakId(keycloak_id);
  }

  @MessagePattern('getAllWebinaire')
  public getAllWebinaire() {
    this.logger.log(`Méthode pour voir tous les webinaires`)
    return this.webinaireService.getAllWebinaireAlternant();
  }
}
