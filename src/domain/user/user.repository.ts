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
  
}