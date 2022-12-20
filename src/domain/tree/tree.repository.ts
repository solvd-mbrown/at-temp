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

@Injectable({ scope: Scope.REQUEST })
export class TreeRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService
  ) {}
  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async addNewTree(treeData: any): Promise<Tree> {
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
    if (spouses && spouses.length && spouses[0].data.UserS) {
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
    if (parent && parent.length && parent[0].data.UserP) {
      parentId = parent[0].data.UserP.identity;
    }

    const result = await this.query()
      .fetchAllByEntityId(treeId, "Tree")
      .commitWithReturnEntity();

    if (parentId === null) {
      parentId = userId;
    }

    const spouses = await this.query()
      .fetchUserByUserId(+parentId)
      .resolveUsersSpouseByRelationByTreeId(treeId.toString())
      .commitWithReturnEntities();
    let spouseId = null;
    if (spouses && spouses.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    const currentSubTree = await this.getMarriedSubTreeUsersByUserId(spouseId);
    return { result, currentSubTree, parentId, spouseId };
  }

  async getDataFromTreeNew(treeId: number, userId: string) {
    const userDataRaw = await this.query()
      .findEntityById("User", +userId)
      .commitWithReturnEntities();

    const userData = userDataRaw[0].data.User;

    const myTreeIdByParent1 = userData?.properties?.myTreeIdByParent1;
    const spouseTreeId = userData?.properties?.spouseTreeId;

    if (myTreeIdByParent1 && spouseTreeId) {
      var spouseWithSubTree = await this.query()
        .findEntityById("User", +userId)
        .raw(
          `OPTIONAL MATCH(User)-[:USER_MARRIED_SUB_TREE_USER_TREE_${spouseTreeId}]-(Parent:User)
      OPTIONAL MATCH(User)-[:USER_DESCENDANT_USER_TREE_${myTreeIdByParent1}]-(Parent)
      WITH User, Parent
      OPTIONAL MATCH(User)-[:USER_MARRIED_USER_TREE_${spouseTreeId}]-(CurrentSpouseMarriedTo:User)
      RETURN User, Parent, CurrentSpouseMarriedTo
      `
        )
        .commit();
    }

    let parentId = null;
    // if we are fetching spouse -> find parent in her tree
    if (spouseWithSubTree[0]?.Parent?.identity) {
      parentId = spouseWithSubTree[0].Parent.identity;
    } else {
      const parent = await this.query()
        .fetchUserByUserId(+userId)
        .resolveUsersParentsByRelation(treeId.toString())
        .commitWithReturnEntities();

      // parentId = userId => DESCENDANT => parent
      // [1] >>incorrect -> returns mom1.id
      if (parent && parent.length && parent[0].data.UserP) {
        parentId = parent[0].data.UserP.identity;
      }
    }

    // fetch entrire DB by id
    // [2] >>seems valid-> neede more investigation after filtered out
    const result = await this.query()
      .fetchAllByEntityId(treeId, "Tree")
      .commitWithReturnEntity();

    if (parentId === null) {
      parentId = userId;
    }

    // [3] find spouse of father
    const spouses = await this.query()
      .fetchUserByUserId(+parentId)
      .resolveUsersSpouseByRelationByTreeId(treeId.toString())
      .commitWithReturnEntities();
    let spouseId = null;
    if (spouses && spouses.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    // find if spouse has subtree rel-n
    // via subTreeTargetUser rel-n
    // [4] >>incorrect => empty value for mom1
    const currentSubTree = await this.getMarriedSubTreeUsersByUserId(spouseId);

    return { result, currentSubTree, parentId, spouseId };
  }

  // DONE
  async getTreeInPartsUserId(treeId: number, userId: string): Promise<any> {
    const { currentSubTree, parentId, result, spouseId } =
      await this.getDataFromTree(treeId, userId);
    // const { currentSubTree, parentId, result, spouseId } =
    //   await this.getDataFromTreeNew(treeId, userId);

    if (result) {
      const data = result.data;
      const bottomPartTree = await cypher.buildPartTreeWithoutSubTreeRel(
        data,
        parentId,
        treeId.toString()
      );
      const rootPartTree = await cypher.buildRootPartTree(
        data,
        parentId,
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
    // create spouse personal tree
    // add child into spouse personal tree
    const spouses = await this.query()
      .fetchUserByUserId(treeProperties.toUserId)
      .resolveUsersSpouseByRelationByTreeId(id.toString())
      .commitWithReturnEntities();
    let spouseId = null;
    if (spouses && spouses.length && spouses[0].data.UserS) {
      spouseId = spouses[0].data.UserS.identity;
    }

    // DONE
    const arrayOfSpouses = await this.getArrayOfSpouses(
      treeProperties.toUserId,
      id,
      spouseId
    );

    // if arrayOfSpouses.length
    // adding child to each spouse's personal tree -> grand // grand-grandmom // ect...
    if (arrayOfSpouses.length) {
      for (let item of arrayOfSpouses) {
        await this.joinUserToTreeDescendantParent2(
          treeProperties.userId,
          treeProperties.toUserId,
          item.data.UserS.properties.myTreeIdByParent1 //her personal tree id
        );
      }
    }

    // DONE
    // add all kids to spouse if MARRIED is added after DESCEDNDANT rels
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
        if (childrenCurrentParent.length && spouseTree["id"]) {
          if (kidsCurrent.length == 1) {
            await this.joinUserToTreeDescendantParent2(
              +kidsCurrent[0].identity,
              +spouseId,
              spouseTree["id"]
            );
          }

          if (kidsCurrent.length > 1) {
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
        // DONE
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
        if (kidsCurrent && kidsCurrent.length) {
          userInMarriedTree = await this.query()
            .fetchUserInTree(
              +kidsCurrent[0].identity,
              spouses[0].data.UserS.properties.myTreeIdByParent1
            )
            .commitWithReturnEntity();
        }
        // add existed in fathers`s tree kid in mather`s tree
        if (!userInMarriedTree && kidsCurrent.length) {
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

    // todo -> doesn't build TREE_MEMBER_USER rel
    // not urgent
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

    if (result) {
      const output = result.data;
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async joinToTreeMarried(id: number, treeProperties: any): Promise<any> {
    // CURRENT TASK
    // add to new spouse(only current one) add above all kids
    // that were added before
    const result = await this.query()
      .createMemberAndMarriedRelations(
        treeProperties.userId, // spouse(current user that is being added into the tree)
        treeProperties.toUserId, // spouse married to
        id
      )
      .commitWithReturnEntity();

    const childrenCurrentParent = await this.query()
      .fetchUserByUserId(+treeProperties.toUserId)
      .resolveUsersChildrenByRelation(UtilsRepository.getStringVersion(id))
      .commitWithReturnEntities();

    const marriedUser = await this.query()
      .fetchUserByUserId(+treeProperties.userId)
      .commitWithReturnEntity();

    const marriedToUser = await this.query()
      .fetchUserByUserId(+treeProperties.toUserId)
      .commitWithReturnEntity();

    // if (marriedUser && marriedToUser.data.User.properties.myTreeIdByParent1) {
    //   await this.query()
    //   .createMemberAndMarriedRelations(treeProperties.toUserId, treeProperties.userId, marriedToUser.data.User.properties.myTreeIdByParent1)
    //   .commitWithReturnEntity();
    // }

    if (marriedToUser && marriedToUser.data.User.properties.subTreeTargetUser) {
      const subTreeUser = await this.query()
        .fetchUserByUserId(marriedToUser.data.User.properties.subTreeTargetUser)
        .commitWithReturnEntity();

      if (subTreeUser && subTreeUser.data.User.properties.myTreeIdByParent1) {
        await this.updateUserParamMyTreeIdByParent1(
          treeProperties.toUserId,
          subTreeUser.data.User.properties.myTreeIdByParent1
        );
        await this.query()
          .createMemberAndMarriedRelations(
            treeProperties.userId,
            treeProperties.toUserId,
            subTreeUser.data.User.properties.myTreeIdByParent1
          )
          .commitWithReturnEntity();
      }
    }

    const childrenMarriedParent = await this.query()
      .fetchUserByUserId(+treeProperties.userId)
      .resolveUsersChildrenByRelation(
        marriedUser.data.User.properties.myTreeIdByParent1
      )
      .commitWithReturnEntities();

    let kidsCurrent;
    let kidsMarried;

    if (
      childrenCurrentParent.length &&
      !childrenMarriedParent.length &&
      marriedUser.data.User.properties.myTreeIdByParent1
    ) {
      kidsCurrent = childrenCurrentParent[0].data.UserKList;
      if (kidsCurrent.length == 1) {
        await this.joinUserToTreeDescendantParent2(
          +kidsCurrent[0].identity,
          +treeProperties.userId,
          marriedUser.data.User.properties.myTreeIdByParent1
        );
      }

      if (kidsCurrent.length > 1) {
        for (let item of kidsCurrent) {
          await this.joinUserToTreeDescendantParent2(
            +item.identity,
            +treeProperties.userId,
            marriedUser.data.User.properties.myTreeIdByParent1
          );
        }
      }
    }

    if (childrenMarriedParent.length && !childrenCurrentParent.length) {
      kidsMarried = childrenMarriedParent[0].data.UserKList;

      if (kidsMarried.length == 1) {
        await this.joinUserToTreeDescendantParent2(
          +kidsMarried[0].identity,
          treeProperties.toUserId,
          id
        );

        if (kidsMarried.length > 1) {
          for (let item of kidsCurrent) {
            await this.joinUserToTreeDescendantParent2(
              +item.identity,
              treeProperties.toUserId,
              id
            );
          }
        }
      }
    }

    if (childrenMarriedParent.length && childrenCurrentParent.length) {
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
          +treeProperties.toUserId,
          id
        );
      }
      for (let item of diffKidsForM) {
        if (marriedUser.data.User.properties.myTreeIdByParent1) {
          await this.joinUserToTreeDescendantParent2(
            +item.identity,
            +treeProperties.userId,
            marriedUser.data.User.properties.myTreeIdByParent1
          );
        }
      }
    }

    await this.query()
      .fetchUserByUserId(treeProperties.userId)
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
    // >>DOUBLE WORK -> ALREADY HAVE USER
    // WHY WE NEED THIS PROPERTY?
    await this.updateUserParamMyTreeIdByParent2(treeProperties.userId, id);

    const targetUser = await this.query()
      .fetchUserByUserId(treeProperties.userId)
      .commitWithReturnEntities();
    // >>DOUBLE WORK -> 1 REQ TO GET USERS BY ID
    const resultToSubTreeUser = await this.query()
      .fetchUserByUserId(treeProperties.toUserId)
      .commitWithReturnEntities();
    if (
      // >>EXTRACT INTO 1 VARIABLE
      !targetUser[0].data.User.properties.myTreeIdByParent1 ||
      +targetUser[0].data.User.properties.myTreeIdByParent1 == id
    ) {
      // WHY WE NEED A NEW TREE?
      const targetUserTree = await this.addNewTree({
        name: `treeName${treeProperties.userId}`,
        userId: +treeProperties.userId,
      });
      // >> DOUBLE WORK -> ALREADY HAVE USER
      const spouses = await this.query()
        .fetchUserByUserId(treeProperties.userId)
        .resolveUsersSpouseByRelationByTreeId(id.toString())
        .commitWithReturnEntities();

      // >> REFACTOR THIS BLOCK
      let spouseId = null;
      if (spouses && spouses.length && spouses[0].data.UserS) {
        spouseId = spouses[0].data.UserS.identity;
      }

      if (spouseId) {
        // add current spouse in new tree
        // WHAT IS THE PURPOSE?
        await this.query()
          .createMemberAndMarriedRelations(
            spouses[0].data.UserS.identity,
            treeProperties.userId,
            // >>PYTHON?!
            +targetUserTree["id"]
          )
          .commitWithReturnEntity();

        const childrenCurrentParent = await this.query()
          .fetchUserByUserId(spouses[0].data.UserS.identity)
          .resolveUsersChildrenByRelation(UtilsRepository.getStringVersion(id))
          .commitWithReturnEntities();

        let kidsCurrent;

        if (childrenCurrentParent.length) {
          kidsCurrent = childrenCurrentParent[0].data.UserKList;
          // >> WHY WE NEED THIS IF CHECK
          // IF BELOWE WE HAVE THE SAME
          if (kidsCurrent.length == 1) {
            await this.joinUserToTreeDescendantParent2(
              +kidsCurrent[0].identity,
              +treeProperties.userId,
              +targetUserTree["id"]
            );
          }

          if (kidsCurrent.length > 1) {
            // >>WHY JS ??? CAN DO IT 1 REQ IN NEO4J
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
      // >> PROMISE ALL?
      // >> 1 REQ ? -> JUST UPDATE
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
        +targetUser[0].data.User.properties.myTreeIdByParent1
      );
      await this.joinUserToTreeDescendantParent1(
        treeProperties.userId,
        treeProperties.toUserId,
        +targetUser[0].data.User.properties.myTreeIdByParent1
      );
      await this.updateUserParamMyTreeIdByParent1(
        treeProperties.userId,
        +targetUser[0].data.User.properties.myTreeIdByParent1
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

    // WHAT IS THE PURPOSE?
    const result = await this.query()
      .createMemberAndMarriedSubTreeRelations(
        treeProperties.userId,
        treeProperties.toUserId,
        id
      )
      .commitWithReturnEntity();

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
    // >>WHAT IS THE DIFFERENCE TO joinUserToTreeDescendantParent1 ??? 1 PARAM?

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
      result.filter((object) => {
        console.log("object>>>>>>>>>>>>>", object);
        return object.identity !== spouseId;
      });
    }

    console.log("result", result);
    // to each wife's personal tree add child -> userId
    return result;
  }

  async getRecursiveSpouses(userId: number, treeId: string): Promise<any> {
    let result = [];

    const parent = await this.query()
      .fetchUserByUserId(userId)
      .resolveUsersParentsByRelation(treeId)
      .commitWithReturnEntities();

    let spouse = null;

    if (parent && parent.length && parent[0].data.UserP) {
      spouse = await this.query()
        .fetchUserByUserId(parent[0].data.UserP.identity)
        .resolveUsersSpouseByRelationByTreeId(treeId.toString())
        .commitWithReturnEntities();
    }

    if (spouse && spouse.length && spouse[0].data.UserS) {
      result.push(spouse[0].data.UserS);
    }

    // base case
    if (parent && parent.length && parent[0].data.UserP) {
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
