import { NestApplication } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "src/services/database/database.service";
import { AppTestingModule } from "src/testing/app-testing.module";
import { UserService } from "../user/user.service";
import { TreeService } from "./tree.service";
import { v4 } from "uuid";
import { User } from "../user/entities/user.entity";
import { CreateUserDto } from "../user/dto/create-user.dto";
import { TreeRelationType } from "./tree.constants";

export const TEST_ACCOUNT = "TEST_ACCOUNT";

export const removeTestUsersQuery = `MATCH(n)-[*1..3]-(otherNodes)
WHERE n.email CONTAINS("${TEST_ACCOUNT}")
DETACH DELETE n, otherNodes;`;

export async function removeTestUsers(db: DatabaseService) {
  await db.write(removeTestUsersQuery, {});
}

export const randomTestName = (prefix?: string) =>
  `${prefix || ""}__${TEST_ACCOUNT}__${v4()}`;

export const userFactory: (prefix?: string) => CreateUserDto = (prefix) => {
  const randomId = randomTestName(prefix);

  return {
    email: randomId,
    firstName: randomId,
    lastName: randomId,
  };
};

describe("TreeService", () => {
  let db: DatabaseService;
  let app: NestApplication;
  let treeService: TreeService;
  let userService: UserService;

  afterAll(async () => {
    await removeTestUsers(db);
    await app.close();
  });

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppTestingModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
      db = moduleFixture.get<DatabaseService>(DatabaseService);
      [treeService, userService] = await Promise.all([
        moduleFixture.resolve<TreeService>(TreeService),
        moduleFixture.resolve<UserService>(UserService),
      ]);
    } catch (e) {
      throw Error(e);
    }
  });

  it("should be defined", () => {
    expect(db).toBeDefined();
    expect(treeService).toBeDefined();
    expect(userService).toBeDefined();
  });

  it("should seed database", async () => {
    const child1Params = userFactory("c1");
    const child1 = await userService.create(child1Params);
    expect(child1.email).toBe(child1Params.email);

    const tree_child1 = await treeService.create({
      name: child1.firstName,
      userId: child1.id,
    });

    expect(tree_child1).toBeDefined();

    const father1 = await userService.create(userFactory("f1"));
    const mom1 = await userService.create(userFactory("m1"));

    // add to tree in top
    // {
    // "relation": "DESCENDANT"
    // "toUserId": new user,
    // "userId": root user in main tree,
    // }
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1.id,
      userId: child1.id,
    });

    // Does mom have DESCENDANT? -> nope
    // add married to main tree
    // {
    // "userId": new married user,
    // "toUserId": user in main tree,
    // "relation": "MARRIED"
    // }
    await treeService.join(tree_child1.id, {
      userId: mom1.id,
      toUserId: father1.id,
      relation: TreeRelationType.MARRIED,
    });

    const father1_father = await userService.create(userFactory("f1_f"));
    const father1_mom = await userService.create(userFactory("f1_m"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1_father.id,
      userId: father1.id,
    });

    // add married to main tree
    // {
    // "userId": new married user,
    // "toUserId": user in main tree,
    // "relation": "MARRIED"
    // }
    await treeService.join(tree_child1.id, {
      userId: father1_mom.id,
      toUserId: father1_father.id,
      relation: TreeRelationType.MARRIED,
    });

    // subtree -> will create new treeId
    const mom1_father = await userService.create(userFactory("m1_f"));
    //  add to sub tree in top
    // {
    // "userId": root user in main tree,
    // "toUserId": new user,
    // "relation": "MARRIEDSUBTREE"
    // }
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: mom1.id,
      toUserId: mom1_father.id,
    });

    const mom1_sister = await userService.create(userFactory("m1_sis"));

    // add to sub tree in bottom
    // {
    // "userId": new user,
    // "toUserId": user in main tree,
    // "relation": "MARRIEDSUBTREE"
    // }
    // ---------
    // >> WILL BE ERROR HERE
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: mom1_sister.id,
      toUserId: mom1_father.id,
    });

    const mom1_mom = await userService.create(userFactory("m1_m"));
    await treeService.join(tree_child1.id, {
      userId: mom1_mom.id,
      toUserId: mom1_father.id,
      relation: TreeRelationType.MARRIED,
    });

    const rel_c1_f1 = await treeService.getTreeInPartsUserId(
      tree_child1.id,
      child1.id.toString()
    );

    // bottompart tests
    expect(rel_c1_f1).toBeDefined();
    expect(rel_c1_f1.bottomPartTree[0].user.identity).toBe(father1.id);
    expect(rel_c1_f1.bottomPartTree[0].user.properties.myTreeIdByParent1).toBe(
      tree_child1.id
    );

    expect(rel_c1_f1.bottomPartTree[0].descendant[0].user.identity).toBe(
      child1.id
    );
    expect(rel_c1_f1.bottomPartTree[0].married[0].identity).toBe(mom1.id);
    expect(
      rel_c1_f1.bottomPartTree[0].married[0].properties.myTreeIdByParent1
    ).toBeTruthy();
    expect(
      rel_c1_f1.bottomPartTree[0].married[0].properties.myTreeIdByParent1 ==
        tree_child1.id
    ).toBeFalsy();
    expect(
      rel_c1_f1.bottomPartTree[0].married[0].properties.myTreeIdByParent2
    ).toBe(tree_child1.id);
    expect(rel_c1_f1.bottomPartTree[0].married[0].properties.spouseTreeId).toBe(
      tree_child1.id
    );
    expect(rel_c1_f1.bottomPartTree[0].descendant[0].descendant.length).toBe(0);
    expect(rel_c1_f1.bottomPartTree[0].descendant[0].married.length).toBe(0);
    expect(rel_c1_f1.bottomPartTree[0].descendant[0].user.identity).toBe(
      child1.id
    );
    expect(
      rel_c1_f1.bottomPartTree[0].descendant[0].user.properties
        .myTreeIdByParent2
    ).toBe(rel_c1_f1.bottomPartTree[0].married[0].properties.myTreeIdByParent1);
    expect(
      rel_c1_f1.bottomPartTree[0].descendant[0].user.properties
        .myTreeIdByParent1
    ).toBe(tree_child1.id);

    // root part tests
    expect(rel_c1_f1.rootPartTree[0].user.identity).toBe(father1_father.id);
    expect(rel_c1_f1.rootPartTree[0].user.properties.myTreeIdByParent1).toBe(
      tree_child1.id
    );
    expect(rel_c1_f1.rootPartTree[0].married[0].identity).toBe(father1_mom.id);
    expect(
      rel_c1_f1.rootPartTree[0].married[0].properties.myTreeIdByParent1
    ).toBeFalsy();
    expect(rel_c1_f1.rootPartTree[0].descendant[0].identity).toBe(father1.id);
    expect(
      rel_c1_f1.rootPartTree[0].descendant[0].properties.myTreeIdByParent1
    ).toBe(tree_child1.id);
    expect(rel_c1_f1.rootPartTree[0].married[0].identity).toBe(father1_mom.id);

    // subtree

    expect(+rel_c1_f1.subTree[0].user.identity).toBe(+mom1_father.id);
    expect(+rel_c1_f1.subTree[0].user.properties.subTreeTargetUser).toBe(
      +mom1.id
    );
    expect(rel_c1_f1.subTree[0].user.properties.myTreeIdByParent1).toBe(
      rel_c1_f1.bottomPartTree[0].married[0].properties.myTreeIdByParent1
    );
    expect(+rel_c1_f1.subTree[0].married[0].identity).toBe(+mom1_mom.id);
    expect(+rel_c1_f1.subTree[0].married[0].properties.spouseTreeId).toBe(
      +tree_child1.id
    );
    expect(+rel_c1_f1.subTree[0].enterPointToSubTree[0].identity).toBe(
      +mom1.id
    );
    expect(rel_c1_f1.subTree[0].descendant[0].descendant.length).toBeFalsy();
    expect(rel_c1_f1.subTree[0].descendant[0].married.length).toBeFalsy();
    expect(rel_c1_f1.subTree[0].descendant[1].descendant.length).toBeFalsy();
    expect(rel_c1_f1.subTree[0].descendant[1].married.length).toBeFalsy();
    expect(+rel_c1_f1.subTree[0].descendant[0].user.identity).toBe(+mom1.id);
    expect(+rel_c1_f1.subTree[0].descendant[1].user.identity).toBe(
      +mom1_sister.id
    );
  }, 999999999);

  it("should work for mom tree", async () => {
    const child1Params = userFactory("c1");
    const child2Params = userFactory("c2");
    const child1 = await userService.create(child1Params);
    expect(child1.email).toBe(child1Params.email);

    const tree_child1 = await treeService.create({
      name: child1.firstName,
      userId: child1.id,
    });

    expect(tree_child1).toBeDefined();

    const father1 = await userService.create(userFactory("f1"));
    const mom1 = await userService.create(userFactory("m1"));

    // add to tree in top
    // {
    // "relation": "DESCENDANT"
    // "toUserId": new user,
    // "userId": root user in main tree,
    // }
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1.id,
      userId: child1.id,
    });

    // Does mom have DESCENDANT? -> nope
    // add married to main tree
    // {
    // "userId": new married user,
    // "toUserId": user in main tree,
    // "relation": "MARRIED"
    // }
    await treeService.join(tree_child1.id, {
      userId: mom1.id,
      toUserId: father1.id,
      relation: TreeRelationType.MARRIED,
    });

    const father1_father = await userService.create(userFactory("f1_f"));
    const father1_mom = await userService.create(userFactory("f1_m"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1_father.id,
      userId: father1.id,
    });

    // add married to main tree
    // {
    // "userId": new married user,
    // "toUserId": user in main tree,
    // "relation": "MARRIED"
    // }
    await treeService.join(tree_child1.id, {
      userId: father1_mom.id,
      toUserId: father1_father.id,
      relation: TreeRelationType.MARRIED,
    });

    const father1_father_father = await userService.create(
      userFactory("f1_f_f")
    );
    const father1_father_mom = await userService.create(userFactory("f1_f_m"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1_father_father.id,
      userId: father1_father.id,
    });

    await treeService.join(tree_child1.id, {
      userId: father1_father_mom.id,
      toUserId: father1_father_father.id,
      relation: TreeRelationType.MARRIED,
    });

    // subtree -> will create new treeId
    const mom1_father = await userService.create(userFactory("m1_f"));
    //  add to sub tree in top
    // {
    // "userId": root user in main tree,
    // "toUserId": new user,
    // "relation": "MARRIEDSUBTREE"
    // }
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: mom1.id,
      toUserId: mom1_father.id,
    });

    const father1_mom_mom = await userService.create(userFactory("f1_m_m"));
    const father1_mom_father = await userService.create(userFactory("f1_m_f"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: father1_mom.id,
      toUserId: father1_mom_father.id,
    });

    const father1_mom_fetched: any = await userService.findOne(father1_mom.id);

    await treeService.join(father1_mom_fetched.myTreeIdByParent1, {
      userId: father1_mom_mom.id,
      toUserId: father1_mom_father.id,
      relation: TreeRelationType.MARRIED,
    });

    const mom1_sister = await userService.create(userFactory("m1_sis"));

    // add to sub tree in bottom
    // {
    // "userId": new user,
    // "toUserId": user in main tree,
    // "relation": "MARRIEDSUBTREE"
    // }
    // ---------
    // >> WILL BE ERROR HERE
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: mom1_sister.id,
      toUserId: mom1_father.id,
    });

    const mom1_mom = await userService.create(userFactory("m1_m"));
    const mom1_fetched: any = await userService.findOne(mom1.id);

    await treeService.join(mom1_fetched.myTreeIdByParent1, {
      userId: mom1_mom.id,
      toUserId: mom1_father.id,
      relation: TreeRelationType.MARRIED,
    });

    const mom1_father_father = await userService.create(userFactory("m1_f_f"));
    const mom1_father_mom = await userService.create(userFactory("m1_f_m"));

    await treeService.join(mom1_fetched.myTreeIdByParent1, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: mom1_father_father.id,
      userId: mom1_father.id,
    });

    await treeService.join(mom1_fetched.myTreeIdByParent1, {
      relation: TreeRelationType.MARRIED,
      userId: mom1_father_mom.id,
      toUserId: mom1_father_father.id,
    });

    const child1_child = await userService.create(userFactory("c1_c"));
    const child1_child2 = await userService.create(userFactory("c1_c2"));
    const child1_child_spouse = await userService.create(
      userFactory("c1_c_sp")
    );
    const child1_child_child = await userService.create(userFactory("c1_c_c"));
    const child1_child_child_spouse = await userService.create(
      userFactory("c1_c_c_sp")
    );

    //  add to tree in bottom
    // {
    // "userId": new user,
    // "toUserId": user in main tree,
    // "relation": "DESCENDANT"
    // }
    await treeService.join(tree_child1.id, {
      userId: child1_child.id,
      toUserId: child1.id,
      relation: TreeRelationType.DESCENDANT,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child2.id,
      toUserId: child1.id,
      relation: TreeRelationType.DESCENDANT,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child_child.id,
      toUserId: child1_child.id,
      relation: TreeRelationType.DESCENDANT,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child_spouse.id,
      toUserId: child1_child.id,
      relation: TreeRelationType.MARRIED,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child_child_spouse.id,
      toUserId: child1_child_child.id,
      relation: TreeRelationType.MARRIED,
    });

    const userToFetchId = mom1_mom.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    const result = await treeService.getTreeInPartsUserId(
      userToFetch.myTreeIdByParent1,
      userToFetchId.toString()
    );

    expect(result).toBeTruthy();
  }, 999999999);

  it("should work for bellow tree", async () => {
    const child1Params = userFactory("c1");
    const child1 = await userService.create(child1Params);
    expect(child1.email).toBe(child1Params.email);

    const tree_child1 = await treeService.create({
      name: child1.firstName,
      userId: child1.id,
    });

    expect(tree_child1).toBeDefined();

    const father1 = await userService.create(userFactory("f1"));
    const mom1 = await userService.create(userFactory("m1"));

    // ---PARENTS
    // add to tree in top
    // {
    // "relation": "DESCENDANT"
    // "toUserId": new user,
    // "userId": root user in main tree,
    // }
    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1.id,
      userId: child1.id,
    });

    await treeService.join(tree_child1.id, {
      userId: mom1.id,
      toUserId: father1.id,
      relation: TreeRelationType.MARRIED,
    });

    // ----SUBTREE -> will create new treeId
    const mom1_father = await userService.create(userFactory("m1_f"));
    const mom1_mom = await userService.create(userFactory("m1_m"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: mom1.id,
      toUserId: mom1_father.id,
    });

    await treeService.join(tree_child1.id, {
      userId: mom1_mom.id,
      toUserId: mom1_father.id,
      relation: TreeRelationType.MARRIED,
    });

    const child1_child = await userService.create(userFactory("c1_c"));
    const child1_child2 = await userService.create(userFactory("c1_c2"));
    const child1_child_spouse = await userService.create(
      userFactory("c1_c_sp")
    );
    const child1_child_child = await userService.create(userFactory("c1_c_c"));
    const child1_child_child_spouse = await userService.create(
      userFactory("c1_c_c_sp")
    );

    //  add to tree in bottom
    // {
    // "userId": new user,
    // "toUserId": user in main tree,
    // "relation": "DESCENDANT"
    // }
    await treeService.join(tree_child1.id, {
      userId: child1_child.id,
      toUserId: child1.id,
      relation: TreeRelationType.DESCENDANT,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child2.id,
      toUserId: child1.id,
      relation: TreeRelationType.DESCENDANT,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child_child.id,
      toUserId: child1_child.id,
      relation: TreeRelationType.DESCENDANT,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child_spouse.id,
      toUserId: child1_child.id,
      relation: TreeRelationType.MARRIED,
    });

    await treeService.join(tree_child1.id, {
      userId: child1_child_child_spouse.id,
      toUserId: child1_child_child.id,
      relation: TreeRelationType.MARRIED,
    });

    const userToFetchId = mom1_mom.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    const result = await treeService.getTreeInPartsUserId(
      userToFetch.myTreeIdByParent1,
      userToFetchId.toString()
    );

    // TODOS:
    // m1 no husband(f1)

    // check if i pass in correct treeId into query that gets all rels and nodes
    // check if the spouse's tree get all the correct rels -> we add kids before/after
    // what if we add someone on top of her?

    expect(result).toBeTruthy();
  }, 999999999);
});
