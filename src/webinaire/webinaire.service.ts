import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateWebinaire } from './entity/ICreateWebinaire';
import { ICryptage } from 'src/cryptage/interface/ICryptage';
import { WebinaireAlternantEntity } from './entity/webinaire.entity';
import { retry } from 'rxjs';
import { LoggerService } from 'src/logger/logger.service';

interface IWebinaire {
  keycloak_id_auteur: string;
  titre: string;
  categorie: string;
  type: string;
  niveau: string;
  image: ICryptage;
  source: ICryptage;
}

@Injectable()
export class WebinaireService {
  constructor(
    @InjectRepository(WebinaireAlternantEntity)
    private readonly webinaireApprenantEntity: Repository<WebinaireAlternantEntity>,
    private readonly cryptageService: CryptageService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Ce service permet de créer un nouveau webinaire d'alternant dans la base de données
   * @param {IWebinaire} dataWebinaire - Contient les informations pour créer un webinaire alternant
   * @returns {Promise<WebinaireApprenantEntity>} - Retourne une promesse pour la création des webinaires alternants
   */
  public async createWebinaire(
    dataWebinaire: ICreateWebinaire,
  ): Promise<WebinaireAlternantEntity> {
    this.logger.log(`Service pour créer un webinaire`);
    const {
      keycloak_id_auteur,
      titre,
      categorie,
      type,
      niveau,
      image,
      source,
    } = dataWebinaire;

    this.logger.log(`Récupération des données du webinaire`);

    const encryptedImage = this.cryptageService.encrypt(image);
    const encryptedSource = this.cryptageService.encrypt(source);

    const webinaire = this.webinaireApprenantEntity.create({
      keycloak_id_auteur,
      titre,
      categorie,
      type,
      niveau,
      image: encryptedImage,
      source: encryptedSource,
    });

    this.logger.log(`Enregistrment dans la base de données`);

    return await this.webinaireApprenantEntity.save(webinaire);
  }

  public async getAllWebinaireAlternant() {
    this.logger.log(`Service pour voir tous les webinaires d'un alternant`);
    const alternants = await this.webinaireApprenantEntity.find();

    const decryptedWebinaire = alternants.map((web) => ({
      webinaire_alternant_id: web.webinaire_alternant_id,
      date: web.updatedAt,
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
      source: this.cryptageService.decrypt(web.source),
    }));
    this.logger.log(`Enregistrement dans la base de données`);

    return decryptedWebinaire;
  }

  public async getAllWebinaireByKeycloakId(keycloak_id: string) {
    this.logger.log(`Service pour prendre tous les webiniares depuis l'id de Keycloak`);
    const webinaire = await this.webinaireApprenantEntity.find({
      where: { keycloak_id_auteur: keycloak_id },
    });

    if (webinaire.length === 0) {
      return [];
    }

    const decryptedWebinaire = webinaire.map((web) => ({
      webinaire_alternant_id: web.webinaire_alternant_id,
      date: web.updatedAt,
      titre: web.titre,
      categorie: web.categorie,
      type: web.type,
      niveau: web.niveau,
      image: this.cryptageService.decrypt(web.image),
      source: this.cryptageService.decrypt(web.source),
    }));
    this.logger.log(`Enregistrement dans la base de données`);

    return decryptedWebinaire;
  }

}
