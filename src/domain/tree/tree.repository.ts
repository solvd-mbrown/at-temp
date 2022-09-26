import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import * as cypher from 'src/services/database/repository.utils';
import { ConfigService } from '@nestjs/config';
import {CUSTOM_ERROR_MESSAGE, DATABASE_CONNECTION } from 'src/services/database/database.constants';
import { Tree } from './entities/tree.entity';
import { UtilsRepository } from 'src/utils/utils.repository';

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

    await this.query()
    .fetchUserByUserId(treeData.userId)
    .updateEntity(
      'User',
      Object.entries({
        'User.myTreeIdByParent1': UtilsRepository.getStringVersion(result.data.Tree.identity),
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

    if (result) {
      const data = result.data;
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getTreeMembers(id: any): Promise<Tree[]> {
    const result = await this.query()
    .fetchAllByEntityId(id, 'Tree')
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
        treeMembers: data.nList,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getTree(id: any): Promise<Tree[]> {
    const result = await this.query()
    .fetchAllByEntityId(id, 'Tree')
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      const tree = cypher.buildTree(data);
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
       tree: tree[0]
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getTreeByUUID(id: any): Promise<Tree[]> {
    const result = await this.query()
    .fetchAllByEntityUUUID(id, 'Tree')
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      const tree = cypher.buildTree(data);
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
       tree: tree[0]
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getPartTreeByUserId(treeId: number, userId: number): Promise<Tree[]> {
    const spouses = await this.query()
    .fetchUserByUserId(userId)
    .resolveUsersSpouseByRelation()
    .commitWithReturnEntities();
    let spouseId = null;
    if(spouses && spouses.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    const result = await this.query()
    .fetchAllByEntityId(treeId, 'Tree')
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      const tree = cypher.buildPartTree(data, spouseId);
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
       tree: tree[0]
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getTreeInPartsUserId(treeId: number, userId: string): Promise<Tree[]> {
    const parent = await this.query()
    .fetchUserByUserId(+userId)
    .resolveUsersParentsByRelation()
    .commitWithReturnEntities();

    let parentId = null;
    if(parent && parent.length && parent[0].data.UserP) {
      parentId = parent[0].data.UserP.identity;
    }

    const result = await this.query()
    .fetchAllByEntityId(treeId, 'Tree')
    .commitWithReturnEntity();

    if (parentId === null) {
      parentId = userId;
    }

    if (result) {
      const data = result.data;
      const partTree = await cypher.buildPartTreeWithoutSubTreeRel(data, parentId);
      const rootPart = await cypher.buildRootPartTree(data, parentId);
      const subTree = await cypher.buildSubTree(data);
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
       rootPartTree: rootPart ? rootPart[0] : null,
       subTree: subTree ? subTree[0] : null,
       bottomPartTree: partTree ? partTree[0] : null,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinToTreeDescendant(id, treeProperties: any): Promise<any> {

      const spouses = await this.query()
      .fetchUserByUserId(treeProperties.toUserId)
      .resolveUsersSpouseByRelation()
      .commitWithReturnEntities();
      let spouseId = null;
      if(spouses && spouses.length && spouses[0].data.UserS) {
        spouseId = spouses[0].data.UserS.identity;
      }

      if(spouseId) {
        // if(!spouses[0].data.UserS.properties.myTreeIdByParent1 || !spouses[0].data.UserS.properties.myTreeIdByParent2){
        if(!spouses[0].data.UserS.properties.myTreeIdByParent1){

          // crate new tree for spouse
         const spouseTree = await this.addNewTree(
            {
              name: spouses[0].data.UserS.properties.firstName,
              userId: +spouseId,
         });

          // add current spouse in new tree
         await this.query()
         .createMemberAndMarriedRelations(treeProperties.toUserId, spouseId, spouseTree["id"])
         .commitWithReturnEntity();

        await this.query()
         .fetchUserByUserId(spouseId)
         .updateEntity(
            'User',
            Object.entries({
              'User.spouseTreeId': UtilsRepository.getStringVersion(id),
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

         //add kind into new tree for spouse
          await this.query()
          .createMemberAndDescendantRelations(treeProperties.userId, spouseId, spouseTree["id"])
          .commitWithReturnEntity();

          await this.query()
          .fetchUserByUserId(spouseId)
          .updateEntity(
            'User',
            Object.entries({
              'User.myTreeIdByParent2': UtilsRepository.getStringVersion(spouseTree["id"]),
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
          }
        else{
            let spouseInMarriedTree;
            let userInMarriedTree;
            spouseInMarriedTree = await this.query()
            .fetchUserInTree(spouseId, spouses[0].data.UserS.properties.myTreeIdByParent1)
            .commitWithReturnEntity();
            if(!spouseInMarriedTree) {
              // add current spouse in new tree
              await this.query()
              .createMemberAndMarriedRelations(treeProperties.toUserId, spouseId, spouses[0].data.UserS.properties.myTreeIdByParent1)
              .commitWithReturnEntity();

              await this.query()
              .fetchUserByUserId(spouseId)
              .updateEntity(
                'User',
                Object.entries({
                  'User.spouseTreeId': UtilsRepository.getStringVersion(id),
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
              spouseInMarriedTree = null;
           }

          userInMarriedTree = await this.query()
          .fetchUserInTree(treeProperties.userId, spouses[0].data.UserS.properties.myTreeIdByParent1)
          .commitWithReturnEntity();
          if(!userInMarriedTree) {
            await this.query()
            .createMemberAndDescendantRelations(treeProperties.userId, spouseId, spouses[0].data.UserS.properties.myTreeIdByParent1)
            .commitWithReturnEntity();

            await this.query()
            .fetchUserByUserId(spouseId)
            .updateEntity(
              'User',
              Object.entries({
                'User.myTreeIdByParent2': UtilsRepository.getStringVersion(spouses[0].data.UserS.properties.myTreeIdByParent1),
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
          }

          if(userInMarriedTree) {
            await this.query()
            .fetchUserByUserId(spouseId)
            .updateEntity(
              'User',
              Object.entries({
                'User.myTreeIdByParent2': UtilsRepository.getStringVersion(spouses[0].data.UserS.properties.myTreeIdByParent1),
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
          }
        }
      }

      const result = await this.query()
      .createMemberAndDescendantRelations(treeProperties.userId, treeProperties.toUserId, id)
      .commitWithReturnEntity();

      await this.query()
      .fetchUserByUserId(treeProperties.userId)
      .updateEntity(
        'User',
        Object.entries({
          'User.myTreeIdByParent1': UtilsRepository.getStringVersion(id),
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

    if(result) {
        const output = result.data;
        return {
         "response": "done"
        };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
 }

  async joinToTreeMarried(id, treeProperties: any): Promise<any> {
    const result = await this.query()
    .createMemberAndMarriedRelations(treeProperties.userId, treeProperties.toUserId, id)
    .commitWithReturnEntity();

    await this.query()
    .fetchUserByUserId(treeProperties.userId)
    .updateEntity(
      'User',
      Object.entries({
        'User.spouseTreeId': UtilsRepository.getStringVersion(id),
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

    if(result) {
      const output = result.data;
      return {
        "response": "done"
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinToTreeMarriedSubTree(id, treeProperties: any): Promise<any> {
    const result = await this.query()
    .createMemberAndMarriedSubTreeRelations(treeProperties.userId, treeProperties.toUserId, id)
    .commitWithReturnEntity();

    // await this.query()
    // .fetchUserByUserId(treeProperties.userId)
    // .updateEntity(
    //   'User',
    //   Object.entries({
    //     'User.spouseTreeId': UtilsRepository.getStringVersion(id),
    //   }).reduce((valuesAcc, [key, value]) => {
    //     return value !== undefined && value !== null
    //       ? {
    //         ...valuesAcc,
    //         [key]: value,
    //       }
    //       : valuesAcc;
    //   }, {}),
    // )
    // .commitWithReturnEntity();

    if(result) {
      const output = result.data;
      return {
        "response": "done"
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

}