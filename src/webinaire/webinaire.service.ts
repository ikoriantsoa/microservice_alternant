import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptageService } from 'src/cryptage/cryptage.service';
import { ICreateWebinaire } from './entity/ICreateWebinaire';
import { ICryptage } from 'src/cryptage/interface/ICryptage';
import { WebinaireAlternantEntity } from './entity/webinaire.entity';
import { retry } from 'rxjs';

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
  ) {}

  /**
   * Ce service permet de créer un nouveau webinaire d'alternant dans la base de données
   * @param {IWebinaire} dataWebinaire - Contient les informations pour créer un webinaire alternant
   * @returns {Promise<WebinaireApprenantEntity>} - Retourne une promesse pour la création des webinaires alternants
   */
  public async createWebinaire(
    dataWebinaire: ICreateWebinaire,
  ): Promise<WebinaireAlternantEntity> {
    const {
      keycloak_id_auteur,
      titre,
      categorie,
      type,
      niveau,
      image,
      source,
    } = dataWebinaire;

    

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

    console.log(webinaire);

    return await this.webinaireApprenantEntity.save(webinaire);
  }

  public async getAllWebinaireAlternant() {
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
    console.log('decryptWebinaire', decryptedWebinaire);

    return decryptedWebinaire;
  }

  public async getAllWebinaireByKeycloakId(keycloak_id: string) {
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
    console.log('decryptWebinaire', decryptedWebinaire);

    return decryptedWebinaire;
  }

}
