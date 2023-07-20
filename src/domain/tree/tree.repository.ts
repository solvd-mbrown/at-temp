import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { Connection } from "cypher-query-builder";
import * as cypher from "src/services/database/repository.utils";
import { ConfigService } from "@nestjs/config";
import {
  CUSTOM_ERROR_MESSAGE,
  DATABASE_CONNECTION,
} from "src/services/database/database.constants";
import { Tree } from "./entities/tree.entity";
import { UtilsRepository } from "src/utils/utils.repository";
import { HusbandTreeUserType } from "./tree.types";

@Injectable({ scope: Scope.REQUEST })
export class TreeRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService
  ) {}
  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async addNewTree(treeData: { name: string; userId: number }): Promise<Tree> {
    const result = await this.query()
      .createEntity<{ [key in keyof Partial<Tree>]: any }>(
        "Tree",
        { name: treeData.name },
        true
      )
      .commitWithReturnEntity();

    await this.query()
      .createMemberRelation(treeData.userId, result.data.Tree.identity)
      .commitWithReturnEntity();

    await this.updateUserParamTreeOwner(treeData.userId);

    await this.query()
      .fetchUserByUserId(treeData.userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.myTreeIdByParent1": UtilsRepository.getStringVersion(
            result.data.Tree.identity
          ),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
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
      .fetchAllByEntityId(id, "Tree")
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
      .fetchAllByEntityId(id, "Tree")
      .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      const tree = cypher.buildTree(data, id);
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
        tree: tree[0],
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async removeUserFromTree(id: number): Promise<any> {
    const result = await this.query()
      .deleteUserFromTree("User", id)
      .commitWithReturnEntity();
    if (result) {
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async removeTree(id: number): Promise<any> {
    const result = await this.query()
      .deleteEntityById("Tree", id)
      .commitWithReturnEntity();
    if (result) {
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getTreeByUUID(id: any): Promise<Tree[]> {
    const result = await this.query()
      .fetchAllByEntityUUUID(id, "Tree")
      .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      const tree = cypher.buildTree(data, data.Tree.identity);
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
        tree: tree[0],
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getPartTreeByUserId(treeId: number, userId: number): Promise<Tree[]> {
    const spouses = await this.query()
      .fetchUserByUserId(userId)
      .resolveUsersSpouseByRelationByTreeId(treeId.toString())
      .commitWithReturnEntities();
    let spouseId = null;
    if (spouses && spouses?.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    const result = await this.query()
      .fetchAllByEntityId(treeId, "Tree")
      .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      const tree = cypher.buildPartTree(data, spouseId, treeId.toString());
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
        tree: tree[0],
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getDataFromTree(treeId: number, userId: string) {
    const parent = await this.query()
      .fetchUserByUserId(+userId)
      .resolveUsersParentsByRelation(treeId.toString())
      .commitWithReturnEntities();

    let parentId = null;
    if (parent && parent?.length && parent[0].data.UserP) {
      parentId = parent[0].data.UserP.identity;
    }

    const resultForSubTree = await this.query()
      .fetchAllByEntityId(treeId, "Tree")
      .commitWithReturnEntity();
    const result = await this.getOverwriteTreeForSpouse(treeId);

    if (parentId === null) {
      parentId = userId;
    }

    const spouses = await this.query()
      .fetchUserByUserId(+parentId)
      .resolveUsersSpouseByRelationByTreeId(treeId.toString())
      .commitWithReturnEntities();
    let spouseId = null;
    if (spouses && spouses?.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    const currentSubTree = await this.getMarriedSubTreeUsersByUserId(spouseId);
    return { result, resultForSubTree, currentSubTree, parentId, spouseId };
  }

  async getOverwriteTreeForSpouse(bottomTreeId) {
    const resForBottomTree = await this.query()
      .raw(
        `MATCH(Tree:Tree)
    WHERE id(Tree)=${bottomTreeId}
    OPTIONAL MATCH(tree)<-[:TREE_MEMBER_USER]-(user:User)
    OPTIONAL MATCH(user)-[rList*1]-(nList)
    RETURN {Tree:Tree,rList:collect(distinct rList),nList:collect(distinct nList)} as data
    `
      )
      .commit();

    resForBottomTree[0].data.nList = resForBottomTree[0].data.nList.map(
      (user) => {
        let res = {
          ...user,
          properties: {
            ...user.properties,
            myTreeIdByParent1: bottomTreeId,
            myTreeIdByParent2: bottomTreeId,
          },
        };
        if (user.properties.spouseTreeId) {
          res = {
            ...res,
            properties: { ...user.properties, spouseTreeId: bottomTreeId },
          };
        }
        return res;
      }
    );

    resForBottomTree[0].data.rList = resForBottomTree[0].data.rList.map(
      (rel) => {
        return rel.map((item) => ({
          ...item,
          label: item.label.replace(/([\d]+)/, bottomTreeId),
        }));
      }
    );

    return resForBottomTree[0];
  }

  async getDataFromTreeSpouseNoSubtree(
    treeId: number,
    userId: string,
    spouseRels
  ) {
    const topParentId = userId;
    const topSpouseId = null;
    const topTreeId = treeId;
    const bottomParentId = spouseRels[0].CurrentSpouseMarriedTo.identity;
    const bottomSpouseId = userId;
    const bottomTreeId =
      spouseRels[0].CurrentSpouseMarriedTo.properties.myTreeIdByParent1;

    // fetch entrire DB by id
    const result = await this.query()
      .fetchAllByEntityId(treeId, "Tree")
      .commitWithReturnEntity();

    const resForBottomTree = await this.getOverwriteTreeForSpouse(bottomTreeId);

    const currentSubTree = await this.getMarriedSubTreeUsersByUserId(
      topSpouseId
    );

    return {
      result,
      currentSubTree,
      topParentId,
      topSpouseId,
      topTreeId,
      bottomParentId,
      bottomSpouseId,
      bottomTreeId,
      resForBottomTree,
    };
  }

  async getDataFromTreeSpouseWithSubtree(
    treeId: number,
    userId: string,
    spouseRels
  ) {
    let topParentId: string;
    let topSpouseId;

    const topTreeId = treeId;
    const bottomParentId = spouseRels[0].CurrentSpouseMarriedTo.identity;
    const bottomSpouseId = userId;
    const bottomTreeId =
      spouseRels[0].CurrentSpouseMarriedTo.properties.myTreeIdByParent1;

    const parent = await this.query()
      .fetchUserByUserId(+userId)
      .resolveUsersParentsByRelation(topTreeId.toString())
      .commitWithReturnEntities();

    if (parent && parent?.length && parent[0].data.UserP) {
      topParentId = parent[0].data.UserP.identity;
    }

    const result = await this.query()
      .fetchAllByEntityId(topTreeId, "Tree")
      .commitWithReturnEntity();

    const resForBottomTree = await this.getOverwriteTreeForSpouse(bottomTreeId);

    const spouses = await this.query()
      .fetchUserByUserId(+topParentId)
      .resolveUsersSpouseByRelationByTreeId(topTreeId.toString())
      .commitWithReturnEntities();

    if (
      spouses &&
      spouses?.length &&
      (spouses[0].data.UserS || spouses[0].data.User)
    ) {
      topSpouseId =
        spouses[0]?.data?.UserS?.identity || spouses[0].data.User.identity;
    }

    const currentSubTree = await this.getMarriedSubTreeUsersByUserId(
      topSpouseId
    );

    return {
      result,
      resForBottomTree,
      currentSubTree,
      topParentId,
      topSpouseId,
      topTreeId,
      bottomParentId,
      bottomSpouseId,
      bottomTreeId,
    };
  }

  //todo total refactoring Now!!!

  async getTreeInPartsUserIdNew(treeId: number, userId: string): Promise<any> {
    const userDataRaw = await this.query()
      .findEntityById("User", +userId)
      .commitWithReturnEntities();

    const userData = userDataRaw[0].data.User;

    const myTreeIdByParent1 = userData?.properties?.myTreeIdByParent1;

    treeId = myTreeIdByParent1;

    const spouseTreeId = userData?.properties?.spouseTreeId;

    if (myTreeIdByParent1 && spouseTreeId) {
      var spouseRels = await this.query()
        .findEntityById("User", +userId)
        .raw(
          `MATCH(User:User) 
        WHERE id(User)=${userId}
        OPTIONAL MATCH(User)-[:USER_MARRIED_SUB_TREE_USER_TREE_${spouseTreeId}]->(Parent:User)<-[:USER_DESCENDANT_USER_TREE_${myTreeIdByParent1}]-(User)
            WITH User, Parent
            OPTIONAL MATCH(User)-[:USER_MARRIED_USER_TREE_${spouseTreeId}]-(CurrentSpouseMarriedTo:User)
            RETURN User, Parent, CurrentSpouseMarriedTo`
        )
        .commit();
    }

    const firstSpouse = spouseRels?.length > 0 && spouseRels[0];

    // if we are fetching spouse -> find parent in her tree
    if (firstSpouse?.Parent?.identity) {
      var userType = HusbandTreeUserType.SPOUSE_WITH_SUBTREE;
    } else if (firstSpouse?.CurrentSpouseMarriedTo?.identity) {
      var userType = HusbandTreeUserType.SPOUSE_NO_SUBTREE;
    } else {
      var userType = HusbandTreeUserType.HUSBAND;
    }

    switch (userType) {
      case HusbandTreeUserType.HUSBAND:
        var { currentSubTree, parentId, result, resultForSubTree, spouseId } =
          await this.getDataFromTree(treeId, userId);
        if (result) {
          const data = result.data;
          const rootUserForTopData = await this.query()
            .findEntityById("User", +parentId)
            .resolveHusbandTreeUntillEnd(treeId.toString())
            .commit();

          const rootUser = rootUserForTopData[0]?.RootParent;

          if (rootUser) {
            var rootPartTreeUser = [rootUser];
          } else {
            const res = await this.query()
              .findEntityById("User", +parentId)
              .commitWithReturnEntities();
            var rootPartTreeUser = [res[0]?.data.User];
          }
          const bottomPartTree = await cypher.buildPartTreeWithoutSubTreeRel(
            data,
            rootPartTreeUser[0].identity,
            // @ts-ignore
            treeId.toString()
          );

          if (!bottomPartTree[0][0]?.user) {
            bottomPartTree[0][0].user = rootPartTreeUser[0];
          }
          const rootPartTree = await cypher.buildRootPartTree(
            data,
            parentId,
            treeId.toString(),
            currentSubTree,
            rootPartTreeUser
          );
          if (!rootPartTree[0][0]?.identity && !rootPartTree[0][0]?.user) {
            rootPartTree[0][0] = rootPartTreeUser[0];
          }
          const subTree = await cypher.buildSubTree(
            resultForSubTree.data,
            treeId.toString(),
            spouseId,
            currentSubTree
          );
          return {
            id: data.Tree.identity,
            ...data.Tree.properties,
            // rootPartTree: rootPartTree ? rootPartTree[0] : null,
            subTree: subTree ? subTree[0] : null,
            tree: bottomPartTree ? bottomPartTree[0] : null,
          };
        }
        break;

      case HusbandTreeUserType.SPOUSE_NO_SUBTREE:
        var {
          result,
          currentSubTree,
          topParentId,
          topSpouseId,
          topTreeId,
          bottomParentId,
          bottomSpouseId,
          bottomTreeId,
          resForBottomTree,
        } = await this.getDataFromTreeSpouseNoSubtree(
          treeId,
          userId,
          spouseRels
        );

        if (result) {
          const data = result.data;
          const [[bottomPartTreeInit]] =
            await cypher.buildPartTreeWithoutSubTreeRel(
              resForBottomTree.data,
              bottomParentId,
              bottomTreeId.toString()
            );

          const married = [...bottomPartTreeInit.married];
          const user = { ...bottomPartTreeInit.user };

          const bottomPartTree = [
            { ...bottomPartTreeInit, user: married[0], married: [user] },
          ];

          const rootPartTree = await cypher.buildRootPartTree(
            data,
            topParentId,
            topTreeId.toString(),
            currentSubTree,
            null
          );

          return {
            id: data.Tree.identity,
            ...data.Tree.properties,
            rootPartTree: rootPartTree ? rootPartTree[0] : null,
            subTree: null,
            bottomPartTree: bottomPartTree || null,
          };
        }
        break;

      case HusbandTreeUserType.SPOUSE_WITH_SUBTREE:
        var {
          result,
          resForBottomTree,
          currentSubTree,
          topParentId,
          topSpouseId,
          topTreeId,
          bottomParentId,
          bottomSpouseId,
          bottomTreeId,
        } = await this.getDataFromTreeSpouseWithSubtree(
          treeId,
          userId,
          spouseRels
        );

        if (result) {
          const data = result.data;

          const [[bottomPartTreeInit]] =
            await cypher.buildPartTreeWithoutSubTreeRel(
              resForBottomTree.data,
              // bottomParentId,
              topParentId,
              bottomTreeId.toString()
            );

          // const oneLevelAboveSpouse = await this.query()
          //   .fetchUserByUserId(+topParentId)
          //   .resolveUsersSpouseByRelationByTreeId(topTreeId.toString())
          //   .commitWithReturnEntity();

          // const father = oneLevelAboveSpouse.data.User;
          // const fatherSpouse = oneLevelAboveSpouse.data?.UserS;

          // const married = [...bottomPartTreeInit.married];
          // const user = { ...bottomPartTreeInit.user };

          // const bottomPartTree = [
          //   {
          //     user: father,
          //     descendant: [
          //       {
          //         ...bottomPartTreeInit,
          //         user: married[0],
          //         married: [user],
          //       },
          //     ],
          //     married: fatherSpouse ? [fatherSpouse] : [],
          //   },
          // ];

          const rootPartTree = await cypher.buildRootPartTree(
            data,
            topParentId,
            topTreeId.toString(),
            currentSubTree
            // rootUser
          );

          const subTree = await cypher.buildSubTree(
            data,
            topTreeId.toString(),
            topSpouseId,
            currentSubTree
          );

          return {
            id: data.Tree.identity,
            ...data.Tree.properties,
            rootPartTree: rootPartTree ? rootPartTree[0] : null,
            subTree: subTree ? subTree[0] : null,
            bottomPartTree: bottomPartTreeInit ? [bottomPartTreeInit] : null,
          };
        }
        break;

      default:
        break;
    }
  }

  async getTreeInPartsUserId(treeId: number, userId: string): Promise<any> {
    const { currentSubTree, parentId, result, spouseId } =
      await this.getDataFromTree(treeId, userId);

    if (result) {
      const data = result.data;
      const bottomPartTree = await cypher.buildPartTreeWithoutSubTreeRel(
        data,
        parentId,
        treeId.toString()
      );
      const rootPartTree = await cypher.buildRootPartTree(
        data,
        spouseId || parentId,
        treeId.toString(),
        currentSubTree
      );
      const subTree = await cypher.buildSubTree(
        data,
        treeId.toString(),
        spouseId,
        currentSubTree
      );
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
        rootPartTree: rootPartTree ? rootPartTree[0] : null,
        subTree: subTree ? subTree[0] : null,
        bottomPartTree: bottomPartTree ? bottomPartTree[0] : null,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async updateTreeEntity(treeId, treeParams): Promise<any> {
    const params = treeParams;
    // @ts-ignore
    const result = await this.query()
      .findEntityById("Tree", treeId)
      .updateEntity(
        "Tree",
        Object.entries({
          "Tree.name": params.name,
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();

    if (result !== null) {
      const data = result.data;
      return {
        id: data.Tree.identity,
        ...data.Tree.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinToTreeDescendant(id: number, treeProperties: any): Promise<any> {
    const [{ Tree: treeGoingDown }] = await this.query()
      .fetchUserByUserId(treeProperties.toUserId)
      .raw(
        `OPTIONAL MATCH(User)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree:Tree)
    WHERE id(Tree)=${id}`
      )
      .customReturn(`Tree`)
      .commit();

    if (treeGoingDown?.identity) {
      var childId = treeProperties.userId;
    }

    if (childId) {
      const parentData = await this.query()
        .fetchUserByUserId(treeProperties.toUserId)
        .commitWithReturnEntity();

      var husbandTreeId = parentData?.data?.User?.properties?.spouseTreeId;

      if (husbandTreeId) {
        const [
          {
            Husband: { identity, properties },
          },
        ] = await this.query()
          .fetchUserByUserId(treeProperties.toUserId)
          .raw(
            `OPTIONAL MATCH(User)-[:USER_MARRIED_USER_TREE_${husbandTreeId}]->(Husband:User)`
          )
          .customReturn("Husband")
          .commit();

        var husband = { id: identity, ...properties };
        treeProperties.toUserId = husband.id;
        id = husbandTreeId;
      }
    }

    // create spouse personal tree
    // add child into spouse personal tree
    const spouses = await this.query()
      .fetchUserByUserId(treeProperties.toUserId)
      .resolveUsersSpouseByRelationByTreeId(id.toString())
      .commitWithReturnEntities();
    let spouseId = null;
    if (spouses && spouses?.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    const arrayOfSpouses = await this.getArrayOfSpouses(
      treeProperties.toUserId,
      id,
      spouseId
    );

    // if arrayOfspouses?.length
    // adding child to each spouse's personal tree -> grand // grand-grandmom // ect...
    if (arrayOfSpouses?.length) {
      for (let item of arrayOfSpouses) {
        await this.joinUserToTreeDescendantParent2(
          treeProperties.userId,
          treeProperties.toUserId,
          item.data.UserS.properties.myTreeIdByParent1 //her personal tree id
        );
      }
    }

    if (spouseId) {
      const childrenCurrentParent = await this.query()
        .fetchUserByUserId(+treeProperties.toUserId)
        .resolveUsersChildrenByRelation(UtilsRepository.getStringVersion(id))
        .commitWithReturnEntities();

      let kidsCurrent;
      kidsCurrent = childrenCurrentParent[0].data.UserKList;

      const childrenMarriedParent = await this.query()
        .fetchUserByUserId(+treeProperties.userId)
        .resolveUsersChildrenByRelation(
          spouses[0].data.UserS.properties.myTreeIdByParent1
        )
        .commitWithReturnEntities();

      // if spouse doesn;t have tree -> create spouse personal tree
      if (!spouses[0].data.UserS.properties.myTreeIdByParent1) {
        // crate new tree for spouse
        const spouseTree = await this.addNewTree({
          name: spouses[0].data.UserS.properties.firstName,
          userId: +spouseId,
        });
        // add current spouse in new tree
        await this.query()
          .createMemberAndMarriedRelations(
            treeProperties.toUserId,
            spouseId,
            spouseTree["id"]
          )
          .commitWithReturnEntity();
        await this.updateUserParamSpouseTreeId(spouseId, id);
        await this.updateUserParamSpouseTreeId(
          treeProperties.toUserId,
          spouseTree["id"]
        );

        // add kind into new tree for spouse
        await this.joinUserToTreeDescendantParent2(
          +treeProperties.userId,
          +spouseId,
          +spouseTree["id"]
        );

        // js error -> separated
        if (childrenCurrentParent?.length && spouseTree["id"]) {
          if (kidsCurrent?.length == 1) {
            await this.joinUserToTreeDescendantParent2(
              +kidsCurrent[0].identity,
              +spouseId,
              spouseTree["id"]
            );
          }

          if (kidsCurrent?.length > 1) {
            for (let item of kidsCurrent) {
              await this.joinUserToTreeDescendantParent2(
                +item.identity,
                +spouseId,
                spouseTree["id"]
              );
            }
          }
        }
      } else {

        // adding children into existing spouse personal tree(MARRIED rel)
        let spouseInMarriedTree;
        let userInMarriedTree;
        spouseInMarriedTree = await this.query()
          .fetchUserInTree(
            spouseId,
            spouses[0].data.UserS.properties.myTreeIdByParent1
          )
          .commitWithReturnEntity();
        if (!spouseInMarriedTree) {
          // add current spouse in new tree
          await this.query()
            .createMemberAndMarriedRelations(
              treeProperties.toUserId,
              spouseId,
              spouses[0].data.UserS.properties.myTreeIdByParent1
            )
            .commitWithReturnEntity();
          await this.updateUserParamSpouseTreeId(spouseId, id);
        }
        if (kidsCurrent && kidsCurrent?.length) {
          userInMarriedTree = await this.query()
            .fetchUserInTree(
              +kidsCurrent[0].identity,
              spouses[0].data.UserS.properties.myTreeIdByParent1
            )
            .commitWithReturnEntity();
        }
        // add existed in fathers`s tree kid in mather`s tree
        if (!userInMarriedTree && kidsCurrent?.length) {
          await this.joinUserToTreeDescendantParent2(
            +kidsCurrent[0].identity,
            +spouseId,
            spouses[0].data.UserS.properties.myTreeIdByParent1
          );
        }

        await this.joinUserToTreeDescendantParent2(
          +treeProperties.userId,
          +spouseId,
          +spouses[0].data.UserS.properties.myTreeIdByParent1
        );
      }
    }

    const result = await this.query()
      .createMemberAndDescendantRelations(
        treeProperties.userId,
        treeProperties.toUserId,
        id
      )
      .commitWithReturnEntity();

    await this.updateUserParamMyTreeIdByParent1(treeProperties.toUserId, id);
    await this.query()
      .fetchUserByUserId(treeProperties.userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.myTreeIdByParent1": UtilsRepository.getStringVersion(id),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();

    // [KT] add child to every tree
    if (childId) {
      const [vals] = await this.query()
        .raw(
          `MATCH(Tree:Tree)
          WHERE id(Tree) = ${id} 
          OPTIONAL MATCH(Tree)<-[:TREE_MEMBER_USER]-(User:User)
          WHERE User.myTreeIdByParent1 <> "${id}"
          
          WITH COLLECT(DISTINCT toInteger(User.myTreeIdByParent1)) as treeIdsToAttach
          RETURN treeIdsToAttach
          `
        )
        .commit();

      const { treeIdsToAttach } = vals;

      if (treeIdsToAttach?.length > 0) {
        await this.query()
          .raw(
            `OPTIONAL MATCH (Tree:Tree) WHERE id(Tree) IN [${treeIdsToAttach}] WITH Tree MATCH (User:User) WHERE id(User)=${childId} WITH User, Tree MERGE (Tree)<-[:TREE_MEMBER_USER]-(User) RETURN Tree, User`
          )
          .commit();
      }
    } else {
      // create parent tree rel
      await this.query()
        .raw(
          `MATCH (User:User) WHERE ID(User) = ${treeProperties.toUserId}
      MATCH (Tree:Tree) WHERE ID(Tree) = ${id}
      MERGE (User)-[TreeUserRelations:TREE_MEMBER_USER]->(Tree)   
  RETURN {} as data`
        )
        .commit();
    }

    if (result) {
      const output = result.data;
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinToTreeMarried(id: number, treeProperties: any): Promise<any> {
    const spouseId = treeProperties.userId;
    const husbandId = treeProperties.toUserId;

    const husbandUser = await this.query()
      .fetchUserByUserId(+husbandId)
      .commitWithReturnEntity();

    const marriedUser = await this.query()
    .fetchUserByUserId(+treeProperties.userId)
    .commitWithReturnEntity();

    let spouseTree = null;
    if(marriedUser && !marriedUser.data.User.properties.myTreeIdByParent1){
      // create spouse personal tree
      spouseTree = await this.addNewTree({
        name: `SPOUSE_TREE_${spouseId}`,
        userId: spouseId,
      });

      await this.query()
      .createMemberAndMarriedRelations(
        treeProperties.toUserId,
        treeProperties.userId,
        spouseTree.id
      )
      .commitWithReturnEntity();
    }

    if(marriedUser && marriedUser.data.User.properties.myTreeIdByParent1){
      spouseTree = marriedUser.data.User.properties.myTreeIdByParent1
      await this.query()
      .createMemberAndMarriedRelations(
        treeProperties.toUserId,
        treeProperties.userId,
        marriedUser.data.User.properties.myTreeIdByParent1
      )
      .commitWithReturnEntity();
    }

    id = husbandUser.data.User.properties.myTreeIdByParent1;

    const result = await this.query()
      .createMemberAndMarriedRelations(
        treeProperties.userId, // spouse(current user that is being added into the tree)
        husbandId, // spouse married to
        id
      )
      .commitWithReturnEntity();

    // create spouse personal tree

    // const spouseTree = await this.addNewTree({
    // name: `SPOUSE_TREE_${spouseId}`,
    // userId: spouseId,
    // });
    // subtree spouse

    const spouseUser = await this.query()
      .fetchUserByUserId(+spouseId)
      .commitWithReturnEntity();

    if (husbandUser && husbandUser?.data?.User?.properties.subTreeTargetUser) {
      const subTreeUser = await this.query()
        .fetchUserByUserId(husbandUser.data.User.properties.subTreeTargetUser)
        .commitWithReturnEntity();

      if (subTreeUser && subTreeUser.data.User.properties.myTreeIdByParent1) {
        await this.updateUserParamMyTreeIdByParent1(
          husbandId,
          subTreeUser.data.User.properties.myTreeIdByParent1
        );
        await this.query()
          .createMemberAndMarriedRelations(
            spouseId,
            husbandId,
            subTreeUser.data.User.properties.myTreeIdByParent1
          )
          .commitWithReturnEntity();
      }

      if (subTreeUser && subTreeUser?.data?.User?.properties.spouseTreeId) {
        await this.query()
          .createMemberAndMarriedRelations(
            spouseId,
            husbandId,
            subTreeUser.data.User.properties.spouseTreeId
          )
          .commitWithReturnEntity();
      }
    }

    // kids of spouse
    const childrenMarriedParent = await this.query()
      .fetchUserByUserId(+spouseId)
      .resolveUsersChildrenByRelation(
        spouseUser.data.User.properties.myTreeIdByParent1
      )
      .commitWithReturnEntities();

    let kidsCurrent;
    let kidsMarried;

    // direct kids of father
    const childrenCurrentParent = await this.query()
      .fetchUserByUserId(+husbandId)
      .resolveUsersChildrenByRelation(UtilsRepository.getStringVersion(id))
      .commitWithReturnEntities();

    const descendantsCurrentParent = await this.query()
      .fetchUserByUserId(+husbandId)
      .raw(
        `OPTIONAL MATCH(User)-[:TREE_MEMBER_USER]->(Tree:Tree)<-[:TREE_MEMBER_USER]-(Kids:User)
    RETURN COLLECT(DISTINCT ID(Kids)) as data
    `
      )
      .commit();

    const husbandTreeMembers = descendantsCurrentParent[0]?.data;
    if (husbandTreeMembers) {
      await this.query()
        .raw(
          `MATCH(User:User)
      WHERE ID(User) IN [${husbandTreeMembers}]
      WITH User
      MATCH(Tree:Tree)
      WHERE ID(Tree)=${spouseTree.id}
      WITH User, Tree
      MERGE(Tree)<-[:TREE_MEMBER_USER]-(User)
      RETURN Tree, User`
        )
        .commit();
    } else {
      const descendantsCurrentParent = await this.query()
        .fetchUserByUserId(+husbandId)
        .resolveUsersChildrenByRelationUtilEnd(
          UtilsRepository.getStringVersion(id)
        )
        .commitWithReturnEntities();

      kidsCurrent = descendantsCurrentParent[0]?.data?.UserKList;
      if (kidsCurrent?.length > 0) {
        for (let item of kidsCurrent) {
          await this.query()
            .createMemberRelation(
              item.identity,
              spouseUser.data.User.properties.myTreeIdByParent1
            )
            .commitWithReturnEntity();
        }
      }
    }

    // add every single kid till the tree end
    if (
      childrenCurrentParent?.length &&
      !childrenMarriedParent?.length &&
      spouseUser.data.User.properties.myTreeIdByParent1
    ) {
      kidsCurrent = childrenCurrentParent[0].data.UserKList;
      if (kidsCurrent?.length == 1) {
        await this.joinUserToTreeDescendantParent2(
          +kidsCurrent[0].identity,
          +spouseId,
          spouseUser.data.User.properties.myTreeIdByParent1
        );
      }

      if (kidsCurrent?.length > 1) {
        for (let item of kidsCurrent) {
          await this.joinUserToTreeDescendantParent2(
            +item.identity,
            +spouseId,
            spouseUser.data.User.properties.myTreeIdByParent1
          );
        }
      }
    }

    if (childrenMarriedParent?.length && !childrenCurrentParent?.length) {
      kidsMarried = childrenMarriedParent[0].data.UserKList;

      if (kidsMarried?.length == 1) {
        await this.joinUserToTreeDescendantParent2(
          +kidsMarried[0].identity,
          husbandId,
          id
        );

        if (kidsMarried?.length > 1) {
          for (let item of kidsCurrent) {
            await this.joinUserToTreeDescendantParent2(
              +item.identity,
              husbandId,
              id
            );
          }
        }
      }
    }

    if (childrenMarriedParent?.length && childrenCurrentParent?.length) {
      kidsMarried = childrenMarriedParent[0].data.UserKList;
      kidsCurrent = childrenCurrentParent[0].data.UserKList;
      const diffKidsForP = kidsMarried.filter(
        (e) => !kidsCurrent.find((a) => e.firstName == a.firstName)
      );
      const diffKidsForM = kidsCurrent.filter(
        (e) => !kidsMarried.find((a) => e.firstName == a.firstName)
      );
      // const diffKidsForP = kidsMarried.filter(e => !kidsCurrent.find(a => e.identity == a.identity));
      // const diffKidsForM = kidsCurrent.filter(e => !kidsMarried.find(a => e.identity == a.identity));
      for (let item of diffKidsForP) {
        await this.joinUserToTreeDescendantParent2(
          +item.identity,
          +husbandId,
          id
        );
      }
      for (let item of diffKidsForM) {
        if (spouseUser.data.User.properties.myTreeIdByParent1) {
          await this.joinUserToTreeDescendantParent2(
            +item.identity,
            +spouseId,
            spouseUser.data.User.properties.myTreeIdByParent1
          );
        }
      }
    }

    await this.query()
      .fetchUserByUserId(spouseId)
      .updateEntity(
        "User",
        Object.entries({
          "User.spouseTreeId": UtilsRepository.getStringVersion(id),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();

    if (result) {
      const output = result.data;
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinToTreeMarriedSubTree(
    id: number,
    treeProperties: any
  ): Promise<any> {

    const result = await this.query()
    .createMemberAndMarriedSubTreeRelations(
      treeProperties.userId,
      treeProperties.toUserId,
      id
    )
    .commitWithReturnEntity();

    const targetUser = await this.query()
      .fetchUserByUserId(treeProperties.userId)
      .commitWithReturnEntities();
    const targetUserProps = targetUser[0]?.data?.User?.properties;

    if (targetUserProps.spouseTreeId) {
      id = targetUserProps.spouseTreeId;
    }

    await this.updateUserParamMyTreeIdByParent2(treeProperties.userId, id);

    const resultToSubTreeUser = await this.query()
      .fetchUserByUserId(treeProperties.toUserId)
      .commitWithReturnEntities();
    if (
      !targetUserProps?.myTreeIdByParent1 ||
      +targetUserProps?.myTreeIdByParent1 == id
    ) {
      const targetUserTree = await this.addNewTree({
        name: `treeName${treeProperties.userId}`,
        userId: +treeProperties.userId,
      });
      const spouses = await this.query()
        .fetchUserByUserId(treeProperties.userId)
        .resolveUsersSpouseByRelationByTreeId(UtilsRepository.getStringVersion(id))
        .commitWithReturnEntities();

      let spouseId = null;
      if (spouses && spouses?.length && spouses[0].data.UserS) {
        spouseId = spouses[0].data.UserS.identity;
      }

      if (spouseId) {
        await this.query()
          .createMemberAndMarriedRelations(
            spouses[0].data.UserS.identity,
            treeProperties.userId,
            +targetUserTree["id"]
          )
          .commitWithReturnEntity();

        const childrenCurrentParent = await this.query()
          .fetchUserByUserId(spouses[0].data.UserS.identity)
          .resolveUsersChildrenByRelation(UtilsRepository.getStringVersion(id))
          .commitWithReturnEntities();

        let kidsCurrent;

        if (childrenCurrentParent?.length) {
          kidsCurrent = childrenCurrentParent[0].data.UserKList;
          if (kidsCurrent?.length == 1) {
            await this.joinUserToTreeDescendantParent2(
              +kidsCurrent[0].identity,
              +treeProperties.userId,
              +targetUserTree["id"]
            );
          }

          if (kidsCurrent?.length > 1) {
            for (let item of kidsCurrent) {
              await this.joinUserToTreeDescendantParent2(
                +item.identity,
                +treeProperties.userId,
                +targetUserTree["id"]
              );
            }
          }
        }
      }

      await this.updateUserParamTreeOwner(treeProperties.userId);
      await this.updateUserParamMyTreeIdByParent1(
        treeProperties.toUserId,
        +targetUserTree["id"]
      );
      await this.updateUserParamMyTreeIdByParent1(
        treeProperties.userId,
        +targetUserTree["id"]
      );
      await this.joinUserToTreeDescendantParent1(
        treeProperties.userId,
        treeProperties.toUserId,
        +targetUserTree["id"]
      );
    } else {
      await this.updateUserParamMyTreeIdByParent1(
        treeProperties.toUserId,
        +targetUserProps?.myTreeIdByParent1
      );
      await this.joinUserToTreeDescendantParent1(
        treeProperties.userId,
        treeProperties.toUserId,
        +targetUserProps?.myTreeIdByParent1
      );

      await this.query()
        .createMemberRelation(
          treeProperties.toUserId,
          +targetUserProps?.myTreeIdByParent1
        )
        .commitWithReturnEntity();

      await this.updateUserParamMyTreeIdByParent1(
        treeProperties.userId,
        +targetUserProps?.myTreeIdByParent1
      );
    }

    let ToSubTreeUser = treeProperties.userId;

    if (
      resultToSubTreeUser.length &&
      resultToSubTreeUser[0].data.User.properties.subTreeTargetUser
    ) {
      ToSubTreeUser =
        resultToSubTreeUser[0].data.User.properties.subTreeTargetUser;
    }
    await this.updateUserParamSubTreeTargetUser(
      treeProperties.toUserId,
      ToSubTreeUser
    );

    // const result = await this.query()
    //   .createMemberAndMarriedSubTreeRelations(
    //     treeProperties.userId,
    //     treeProperties.toUserId,
    //     id
    //   )
    //   .commitWithReturnEntity();

    await this.query()
      .createMemberRelation(treeProperties.userId, id)
      .commitWithReturnEntity();

    if (result) {
      const output = result.data;
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinUserToTreeDescendantParent2(
    userId: number,
    toUserId: number,
    treeId: number
  ): Promise<any> {
    // >>DO ALL IN 1 QUERY
    await this.query()
      .createMemberAndDescendantRelations(userId, toUserId, treeId)
      .commitWithReturnEntity();

    await this.query()
      .createMemberRelation(userId, treeId)
      .commitWithReturnEntity();

    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.myTreeIdByParent2": UtilsRepository.getStringVersion(treeId),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }

  async joinUserToTreeDescendantParent1(
    userId,
    toUserId,
    treeId
  ): Promise<any> {
    await this.query()
      .createMemberAndDescendantRelations(userId, toUserId, treeId)
      .commitWithReturnEntity();

    await this.query()
      .createMemberRelation(userId, treeId)
      .commitWithReturnEntity();

    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.myTreeIdByParent1": UtilsRepository.getStringVersion(treeId),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }

  async updateUserParamSpouseTreeId(userId, treeId): Promise<any> {
    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.spouseTreeId": UtilsRepository.getStringVersion(treeId),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }
  async updateUserParamMyTreeIdByParent1(userId, treeId): Promise<any> {
    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.myTreeIdByParent1": UtilsRepository.getStringVersion(treeId),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }
  async updateUserParamMyTreeIdByParent2(userId, treeId): Promise<any> {
    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.myTreeIdByParent2": UtilsRepository.getStringVersion(treeId),
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }
  async updateUserParamSubTreeTargetUser(userId, targetUserId): Promise<any> {
    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.subTreeTargetUser": +targetUserId,
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }

  async updateUserParamTreeOwner(userId): Promise<any> {
    await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.treeOwner": true,
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();
  }

  // =======================================>
  // DONE
  async getArrayOfSpouses(userId, treeId, spouseId): Promise<any> {
    let result = await this.getRecursiveSpouses(userId, treeId);

    // remove current wife -> need to add only to all wifes above
    if (spouseId) {
      result?.filter((object) => {
        return object.identity !== spouseId;
      });
    }

    // to each wife's personal tree add child -> userId
    return result || [];
  }

  async getRecursiveSpouses(userId: number, treeId: string): Promise<any> {
    let result = [];

    const parent = await this.query()
      .fetchUserByUserId(userId)
      .resolveUsersParentsByRelation(treeId)
      .commitWithReturnEntities();

    let spouse = null;

    if (parent && parent?.length && parent[0].data.UserP) {
      spouse = await this.query()
        .fetchUserByUserId(parent[0].data.UserP.identity)
        .resolveUsersSpouseByRelationByTreeId(treeId.toString())
        .commitWithReturnEntities();
    }

    if (spouse && spouse.length && spouse[0].data.UserS) {
      result.push(spouse[0].data.UserS);
    }

    // base case
    if (parent && parent?.length && parent[0].data.UserP) {
      await this.getRecursiveSpouses(parent[0].data.UserP.identity, treeId);
    } else {
      return result;
    }
  }

  //=======================================================>
  async getMarriedSubTreeUsersByUserId(userId: number): Promise<any> {
    let testMethod = [];
    testMethod = await this.query()
      .findAllUsersByParam(userId, "User")
      .commitWithReturnEntities();
    if (testMethod) {
      return testMethod.map(({ data }) => {
        const testMethod = data;
        return {
          id: testMethod.User.identity,
          ...testMethod.User.properties,
        };
      });
    }
  }
}
