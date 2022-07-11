import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import * as cypher from 'src/services/database/repository.utils';
import { ConfigService } from '@nestjs/config';
import { CUSTOM_ERROR_MESSAGE, DATABASE_CONNECTION } from 'src/services/database/database.constants';
import { User } from './entities/user.entity';
import { UtilsRepository } from 'src/utils/utils.repository';


@Injectable({ scope: Scope.REQUEST })
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}
  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async addNewUser(userData: any): Promise<User[]> {
    const result = await this.query()
    .createEntity<{ [key in keyof Partial<User>]: any }>('User',
      userData
    )
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
     
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async deleteUser(id: number): Promise<any> {
    const result = await this.query()
    .deleteEntityById('User', id)
    .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return  {
        "response": "done"
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getUserEntity(id: number): Promise<any> {
    const result = await this.query()
    .fetchUserByUserId(id)
    .commitWithReturnEntity();

    const parent = await this.query()
      .fetchUserByUserId(id)
      .resolveUsersParentsByRelation()
      .commitWithReturnEntities();
    let parents = [];
    if(parent && parent[0].data.UserP) {
      parents.push(parent[0].data.UserP)
      if(parent[0].data.UserM) {
        parents.push(parent[0].data.UserM)
      }
    }

    const spouses = await this.query()
      .fetchUserByUserId(id)
      .resolveUsersSpouseByRelation()
      .commitWithReturnEntities();
    let spouse = [];
    if(spouses && spouses[0].data.UserS) {
      spouse.push(spouses[0].data.UserS);
    }

    let siblings = [];
    if (parent && parent[0].data.UserP) {
      const siblingsArr = await this.query()
      .fetchUserByUserId(parent[0].data.UserP.identity)
      .resolveUsersChildrenByRelation()
      .commitWithReturnEntities();

      if(siblingsArr && siblingsArr[0].data.UserKList) {
        let famalyLine = siblingsArr[0].data.UserKList;
        famalyLine = famalyLine.filter(object => {
          return object.identity != id;
        });
        siblings.push(famalyLine);
      }
    }

    const childrens = await this.query()
      .fetchUserByUserId(id)
      .resolveUsersChildrenByRelation()
      .commitWithReturnEntities();

    let kids = [];
    if(childrens && childrens[0].data.UserKList) {
      kids = childrens[0].data.UserKList;
    }

    if (parent && parent[0].data.UserS) {
      const spouseChildrens = await this.query()
      .fetchUserByUserId(spouses[0].data.UserS.identity)
      .resolveUsersChildrenByRelation()
      .commitWithReturnEntities();
      if(spouseChildrens && spouseChildrens[0].data.UserKList) {
        kids = spouseChildrens[0].data.UserKList;
      }
    }

    if (result) {

      if (!parents.length) {
        parents = null;
      }
       if (!siblings.length) {
         siblings = null;
      }
       if (!spouse.length) {
         spouse = null;
      }
       if (!kids.length) {
         kids = null;
      }

      const data = result.data;
      data.User.properties.parents = parents.length ? parents : null;
      data.User.properties.siblings = siblings.length ? siblings : null;
      data.User.properties.spouse = spouse.length ? spouse : null;
      data.User.properties.kids = kids.length ? kids : null;
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async updateUserEntity(
    userId,
    userParams,
  ): Promise<any> {
    const params = userParams;
    // @ts-ignore
    const result = await this.query()
    .fetchUserByUserId(userId)
    .updateEntity(
      'User',
      Object.entries({
        'User.userPictureLink': params?.userPictureLink,
        'User.userPictureKey': params?.userPictureKey,
        'User.firstName': params?.firstName,
        'User.middleName': params?.middleName,
        'User.lastName': params?.lastName,
        'User.introduction':params?.introduction ? UtilsRepository.getStringVersion(params?.introduction) : null,
        'User.birthdate': params?.birthdate,
        'User.dateOfDeath': params?.dateOfDeath,
        'User.deceased': params?.deceased,
        'User.gender': params?.gender,
        'User.hometown': params?.hometown,
        'User.homeCountry': params?.homeCountry,
        'User.email': params?.email,
        'User.phone': params?.phone,
        'User.address': params?.address,
        'User.spouseTreeId': params?.spouseTreeId,
        'User.myTreeId': params?.myTreeId,
        'User.spouse': params?.spouse ? UtilsRepository.getStringVersion(params?.spouse) : null,
        'User.kids': params?.kids ? UtilsRepository.getStringVersion(params?.kids) : null,
        'User.parents': params?.parents ? UtilsRepository.getStringVersion(params?.parents) : null,
        'User.siblings': params?.siblings ? UtilsRepository.getStringVersion(params?.siblings) : null,
        'User.socialNetworks': params?.socialNetworks ? UtilsRepository.getStringVersion(params?.socialNetworks) : null,
        'User.work': params?.work ? UtilsRepository.getStringVersion(params?.work) : null,
        'User.education': params?.education ? UtilsRepository.getStringVersion(params?.education) : null,
      }).reduce((valuesAcc, [key, value]) => {
        return value !== undefined && value !== null
          ? {
            ...valuesAcc,
            [key]: value,
          }
          : valuesAcc;
      }, {}),
    )
    .commitWithReturnEntity();

    if (result !== null) {
      const data = result.data;
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

}