import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import * as cypher from 'src/services/database/repository.utils';
import { ConfigService } from '@nestjs/config';
import { DATABASE_CONNECTION } from 'src/services/database/database.constants';
import { Tree } from './entities/tree.entity';

@Injectable({ scope: Scope.REQUEST })
export class TreeRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {}
  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async addNewTree(treeData: any): Promise<Tree[]> {
    const result = await this.query()
    .createEntity<{ [key in keyof Partial<Tree>]: any }>('Tree',
      {name: treeData.name},
      true
    )
    .commitWithReturnEntity();
    await this.query()
    .createMemberRelation(treeData.userId, result.data.Tree.identity)
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
      };
    }
  }

  async getTree(id: any): Promise<Tree[]> {
    const result = await this.query()

    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
      };
    }
  }
  
  async joinToTreeDescendant(id, treeProperties: any): Promise<any> {
      const result = await this.query()
      .createMemberAndDescendantRelations(treeProperties.userId, treeProperties.toUserId, id)
      .commitWithReturnEntity();
      if(result) {
        const output = result.data;
        return {
         "response": "done"
        };
      }
 }

  async joinToTreeMarried(id, treeProperties: any): Promise<any> {
    const result = await this.query()
    .createMemberAndMarriedRelations(treeProperties.userId, treeProperties.toUserId, id)
    .commitWithReturnEntity();
    if(result) {
      const output = result.data;
      return {
        "response": "done"
      };
    }
  }

}