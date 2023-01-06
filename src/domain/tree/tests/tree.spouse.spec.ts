import { NestApplication } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "src/services/database/database.service";
import { AppTestingModule } from "src/testing/app-testing.module";
import { UserService } from "../../user/user.service";
import { TreeService } from "../tree.service";
import { v4 } from "uuid";
import { User } from "../../user/entities/user.entity";
import { CreateUserDto } from "../../user/dto/create-user.dto";
import { TreeRelationType } from "../tree.constants";
import { generateObj, reccCheck } from "./tree.req-tests";

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

describe("Spouse Tree tests", () => {
  let db: DatabaseService;
  let app: NestApplication;
  let treeService: TreeService;
  let userService: UserService;

  let child1;
  let spouse1;
  let tree_child1;
  let spouse1_father;
  let child1_child;

  // const generateObj = (user, treeId?) => ({
  //   identity: +user.id,
  //   properties: {
  //     myTreeIdByParent1: +treeId || +user.myTreeIdByParent1,
  //   },
  // });

  // const reccCheck = (tree, result) => {
  //   if (!result?.length) {
  //     return;
  //   }

  //   expect(tree.length).toBeGreaterThanOrEqual(1);

  //   tree.forEach((item) => {
  //     expect(item.user).toBeDefined();

  //     const user = item.user;
  //     const married = item.married[0];
  //     expect(+user.identity).toBe(result[0].user.identity);
  //     expect(+user.properties.myTreeIdByParent1).toBe(
  //       result[0].user.properties.myTreeIdByParent1
  //     );
  //     if (married?.identity) {
  //       expect(+married.identity).toBe(result[0].married?.identity);
  //       expect(+married.properties.myTreeIdByParent1).toBe(
  //         result[0].married?.properties.myTreeIdByParent1
  //       );
  //     } else {
  //       expect(married?.identity).toBeFalsy();
  //       expect(married?.myTreeIdByParent1).toBeFalsy();
  //     }
  //   });

  //   result.shift();

  //   tree.forEach((item) => {
  //     reccCheck(item.descendant, result);
  //   });
  // };

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

  it("ARTR-217 should allow logged user to navigate to the spouse tree", async () => {
    // [x] Create user
    // [x] Add a spouse to the logged user
    // [x] Add a parent to the spouse
    // [x] Add a child to the spouse
    // [x] Tap long press on the spouse's icon

    const child1Params = userFactory("c1");
    child1 = await userService.create(child1Params);
    expect(child1.email).toBe(child1Params.email);

    tree_child1 = await treeService.create({
      name: child1.firstName,
      userId: child1.id,
    });

    expect(tree_child1).toBeDefined();

    spouse1 = await userService.create(userFactory("sp1"));

    await treeService.join(tree_child1.id, {
      userId: spouse1.id,
      toUserId: child1.id,
      relation: TreeRelationType.MARRIED,
    });

    spouse1 = await userService.findOne(spouse1.id);

    spouse1_father = await userService.create(userFactory("sp_f"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: spouse1.id,
      toUserId: spouse1_father.id,
    });

    child1_child = await userService.create(userFactory("c1_c"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: child1.id,
      userId: child1_child.id,
    });

    const userToFetchId = spouse1.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    const result = await treeService.getTreeInPartsUserId(
      userToFetch.myTreeIdByParent1,
      userToFetchId.toString()
    );

    expect(result).toBeTruthy();

    const rootPartTree = result.rootPartTree[0];
    expect(+rootPartTree.identity).toBe(+spouse1_father.id);
    expect(+rootPartTree.properties.myTreeIdByParent1).toBe(
      +spouse1.myTreeIdByParent1
    );
    expect(+rootPartTree.properties.myTreeIdByParent1).toBe(
      +spouse1.myTreeIdByParent1
    );

    expect(result.subTree).toBeFalsy();

    [spouse1_father, spouse1, child1, child1_child] = await Promise.all(
      [spouse1_father.id, spouse1.id, child1.id, child1_child.id].map((id) =>
        userService.findOne(id)
      )
    );

    const bottomPartTree = result.bottomPartTree;

    const bottomPartTreeExpectedResult = [
      {
        user: generateObj(spouse1_father),
        married: null,
      },
      {
        user: generateObj(spouse1),
        married: generateObj(child1),
      },
      {
        user: generateObj(child1_child),
        married: null,
      },
    ];

    reccCheck(bottomPartTree, bottomPartTreeExpectedResult);
  });
});
