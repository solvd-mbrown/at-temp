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
  let sp_brother;

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

    const userToFetchId = spouse1.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

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
      [
        {
          user: generateObj(spouse1_father),
          married: null,
        },
      ],
      [
        {
          user: generateObj(spouse1),
          married: generateObj(child1),
        },
      ],
      [
        {
          user: generateObj(child1_child),
          married: null,
        },
      ],
    ];

    reccCheck(bottomPartTree, bottomPartTreeExpectedResult);
  }, 99999999);

  it("ARTR-218 Partner sibling is not visible on the partner tree", async () => {
    // [x] Add a partner to the logged user
    // [x] Add a parent to the partner
    // [x] Add a child to the partner's parent
    // [x] Go to Partner's parent tree
    // [x] Return to partner's tree
    // [x] Return to the logged user tree
    // [x] Go to partner's tree

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

    const userToFetchId = spouse1.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    spouse1_father = await userService.create(userFactory("sp_f"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: spouse1.id,
      toUserId: spouse1_father.id,
    });

    sp_brother = await userService.create(userFactory("sp1_bro"));

    await treeService.join(userToFetch.myTreeIdByParent1, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: spouse1_father.id,
      userId: sp_brother.id,
    });

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

    [spouse1_father, spouse1, sp_brother, child1, child1_child] =
      await Promise.all(
        [spouse1_father.id, spouse1.id, sp_brother.id, child1.id].map((id) =>
          userService.findOne(id)
        )
      );

    const bottomPartTree = result.bottomPartTree;

    const bottomPartTreeExpectedResult = [
      [
        {
          user: generateObj(spouse1_father),
          married: null,
        },
      ],
      [
        {
          user: generateObj(spouse1),
          married: generateObj(child1),
        },
        {
          user: generateObj(sp_brother),
          married: null,
        },
      ],
    ];

    reccCheck(bottomPartTree, bottomPartTreeExpectedResult);

    const c1_res = await treeService.getTreeInPartsUserId(
      tree_child1.id,
      child1.id.toString()
    );

    const c1_rootPartTree = c1_res.rootPartTree[0];
    expect(+c1_rootPartTree.identity).toBe(+child1.id);
    expect(+c1_rootPartTree.properties.myTreeIdByParent1).toBe(
      +child1.myTreeIdByParent1
    );

    const c1_bottomPartTreeExpectedResult = [
      [
        {
          user: generateObj(child1),
          married: generateObj(spouse1),
        },
      ],
    ];

    reccCheck(c1_res.bottomPartTree, c1_bottomPartTreeExpectedResult);

    const spouse1_father_res = await treeService.getTreeInPartsUserId(
      spouse1_father.myTreeIdByParent1,
      spouse1_father.id.toString()
    );

    const spouse1_father_res_rootPartTree = spouse1_father_res.rootPartTree[0];
    expect(+spouse1_father_res_rootPartTree.identity).toBe(+spouse1_father.id);
    expect(+spouse1_father_res_rootPartTree.properties.myTreeIdByParent1).toBe(
      +spouse1_father.myTreeIdByParent1
    );

    const spouse1_father_res_bottomPartTreeExpectedResult = [
      [
        {
          user: generateObj(spouse1_father),
          married: null,
        },
      ],
      [
        {
          user: generateObj(spouse1),
          married: generateObj(child1),
        },
        {
          user: generateObj(sp_brother),
          married: null,
        },
      ],
    ];

    reccCheck(
      spouse1_father_res.bottomPartTree,
      spouse1_father_res_bottomPartTreeExpectedResult
    );
  }, 99999999);

  it("ARTR-223 should allow to add childrent to spouse using spouse treeId", async () => {
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

    const userToFetchId = spouse1.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    spouse1_father = await userService.create(userFactory("sp_f"));

    await treeService.join(tree_child1.id, {
      relation: TreeRelationType.MARRIEDSUBTREE,
      userId: spouse1.id,
      toUserId: spouse1_father.id,
    });

    child1_child = await userService.create(userFactory("c1_c"));

    await treeService.join(userToFetch.myTreeIdByParent1, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: userToFetchId,
      userId: child1_child.id,
    });

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
      [
        {
          user: generateObj(spouse1_father),
          married: null,
        },
      ],
      [
        {
          user: generateObj(spouse1),
          married: generateObj(child1),
        },
      ],
      [
        {
          user: generateObj(child1_child),
          married: null,
        },
      ],
    ];

    reccCheck(bottomPartTree, bottomPartTreeExpectedResult);

    const child1_res = await treeService.getTreeInPartsUserId(
      child1.myTreeIdByParent1,
      child1.id.toString()
    );
    const child1_rootPartTree = child1_res.rootPartTree[0];
    expect(+child1_rootPartTree.identity).toBe(+child1.id);

    const child1_bottomPartTree = child1_res.bottomPartTree;

    const child1_bottomPartTreeExpectedResult = [
      [
        {
          user: generateObj(child1),
          married: generateObj(spouse1),
        },
      ],
      [
        {
          user: generateObj(child1_child),
          married: null,
        },
      ],
    ];
    reccCheck(child1_bottomPartTree, child1_bottomPartTreeExpectedResult);

    const child1_child_res = await treeService.getTreeInPartsUserId(
      child1_child.myTreeIdByParent1,
      child1_child.id.toString()
    );
    const child1_child_rootPartTree = child1_child_res.rootPartTree[0];
    expect(+child1_child_rootPartTree.identity).toBe(+child1.id);

    const child1_child_bottomPartTree = child1_child_res.bottomPartTree;

    const child1_child_bottomPartTreeExpectedResult = [
      [
        {
          user: generateObj(child1),
          married: generateObj(spouse1),
        },
      ],
      [
        {
          user: generateObj(child1_child),
          married: null,
        },
      ],
    ];
    reccCheck(
      child1_child_bottomPartTree,
      child1_child_bottomPartTreeExpectedResult
    );
  }, 99999999);

  it("ARTR-222(NOT FINISHED) should display husnand in spouse tree", async () => {
    // [x] Add a spouse to a logged user
    // [x] Go to spouse’s profile screen → Family members section

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

    const userToFetchId = spouse1.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    const result = await treeService.getTreeInPartsUserId(
      userToFetch.myTreeIdByParent1,
      userToFetchId.toString()
    );

    expect(result).toBeTruthy();

    // const rootPartTree = result.rootPartTree[0];
    // expect(+rootPartTree.identity).toBe(+spouse1_father.id);
    // expect(+rootPartTree.properties.myTreeIdByParent1).toBe(
    //   +spouse1.myTreeIdByParent1
    // );
    // expect(+rootPartTree.properties.myTreeIdByParent1).toBe(
    //   +spouse1.myTreeIdByParent1
    // );

    // expect(result.subTree).toBeFalsy();

    // [spouse1_father, spouse1, child1, child1_child] = await Promise.all(
    //   [spouse1_father.id, spouse1.id, child1.id, child1_child.id].map((id) =>
    //     userService.findOne(id)
    //   )
    // );

    // const bottomPartTree = result.bottomPartTree;

    // const bottomPartTreeExpectedResult = [
    //   [
    //     {
    //       user: generateObj(spouse1_father),
    //       married: null,
    //     },
    //   ],
    //   [
    //     {
    //       user: generateObj(spouse1),
    //       married: generateObj(child1),
    //     },
    //   ],
    //   [
    //     {
    //       user: generateObj(child1_child),
    //       married: null,
    //     },
    //   ],
    // ];

    // reccCheck(bottomPartTree, bottomPartTreeExpectedResult);
  }, 99999999);
});
