import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import * as cypher from 'src/services/database/repository.utils';
import { ConfigService } from '@nestjs/config';
import { DATABASE_CONNECTION } from 'src/services/database/database.constants';
import { User } from './entities/user.entity';


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
  }
  async getUserEntity(id: number): Promise<any> {
    const result = await this.query()
    .fetchUserByUserId(id)
    .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
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
        'User.IntroductionText':params?.IntroductionText,
        'User.IntroductionImageLinks':params?.IntroductionImageLinks ? UserRepository.getStringVersion(params?.IntroductionImageLinks) : null,
        'User.birthdate': params?.birthdate,
        'User.dateOfDeath': params?.dateOfDeath,
        'User.deceased': params?.deceased,
        'User.gender': params?.gender,
        'User.hometown': params?.hometown,
        'User.homeCountry': params?.homeCountry,
        'User.email': params?.email,
        'User.phone': params?.phone,
        'User.address': params?.address,
        'User.spouse': params?.spouse ? UserRepository.getStringVersion(params?.spouse) : null,
        'User.kids': params?.kids ? UserRepository.getStringVersion(params?.kids) : null,
        'User.socialNetworks': params?.socialNetworks ? UserRepository.getStringVersion(params?.socialNetworks) : null,
        'User.work': params?.work ? UserRepository.getStringVersion(params?.work) : null,
        'User.education': params?.education ? UserRepository.getStringVersion(params?.education) : null,
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
  }

  static getStringVersion(param): string {
    return typeof param === 'string' ? param : JSON.stringify(param);
  }


}