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

describe("Husband Tree tests", () => {
  let db: DatabaseService;
  let app: NestApplication;
  let treeService: TreeService;
  let userService: UserService;

  let child1;
  let spouse1;
  let tree_child1;
  let spouse1_father;
  let child1_child;

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

  it("should be able to add multiple kids after adding wife", async () => {
    // добавил ребенка себе
    // добавил жену
    // добавил себе отца
    // ----не могу добавить себе еще одного ребенка (прохожу все шаги добавления но в итоге никто не добавляется)
    // могу добавить ребенка и супруга уже добавленному ребенку
    // если открыть дерево моей матери - вижу всех родственников ниже ее, добавление работает
    // если открыть дерево моей бабушки по отцу - тоже работает
    // ----если открыть дерево мого дедушкии или бабушки по матери - вижу только деда/бабу - мать - меня, а должен видеть деда/бабу - мать/отца - меня/жену - детей

    const father1 = await userService.create(userFactory("f1"));
    const mom1 = await userService.create(userFactory("m1"));

    const tree_f1 = await treeService.create({
      name: father1.firstName,
      userId: father1.id,
    });

    const child1 = await userService.create(userFactory("c1"));
    const child2 = await userService.create(userFactory("c2"));

    await treeService.join(tree_f1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1.id,
      userId: child1.id,
    });

    const tree_res = await treeService.getTreeInPartsUserId(
      tree_f1.id,
      child1.id.toString()
    );

    await treeService.join(tree_f1.id, {
      userId: mom1.id,
      toUserId: father1.id,
      relation: TreeRelationType.MARRIED,
    });

    const father1_father = await userService.create(userFactory("f1_f"));

    await treeService.join(tree_f1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1_father.id,
      userId: father1.id,
    });

    await treeService.join(tree_f1.id, {
      relation: TreeRelationType.DESCENDANT,
      toUserId: father1.id,
      userId: child2.id,
    });

    const userToFetchId = child1.id;
    const userToFetch: any = await userService.findOne(userToFetchId);

    const result = await treeService.getTreeInPartsUserId(
      userToFetch.myTreeIdByParent1,
      userToFetchId.toString()
    );

    expect(result).toBeTruthy();

    // // ----SUBTREE -> will create new treeId
    // const mom1_father = await userService.create(userFactory("m1_f"));
    // const mom1_mom = await userService.create(userFactory("m1_m"));

    // await treeService.join(tree_child1.id, {
    //   relation: TreeRelationType.MARRIEDSUBTREE,
    //   userId: mom1.id,
    //   toUserId: mom1_father.id,
    // });

    // const mom1_fetched: any = await userService.findOne(mom1.id);

    // await treeService.join(mom1_fetched.myTreeIdByParent1, {
    //   userId: mom1_mom.id,
    //   toUserId: mom1_father.id,
    //   relation: TreeRelationType.MARRIED,
    // });

    // // ----SUBTREE of SUBTREE
    // const mom1_mom_father = await userService.create(userFactory("m1_m_f"));
    // const mom1_mom_mom = await userService.create(userFactory("m1_m_m"));
    // const mom1_father_fetched: any = await userService.findOne(mom1_father.id);

    // await treeService.join(mom1_father_fetched.myTreeIdByParent1, {
    //   relation: TreeRelationType.MARRIEDSUBTREE,
    //   userId: mom1_mom.id,
    //   toUserId: mom1_mom_father.id,
    // });

    // const mom1_mom_fetched: any = await userService.findOne(mom1_mom.id);

    // await treeService.join(mom1_mom_fetched.myTreeIdByParent1, {
    //   userId: mom1_mom_mom.id,
    //   toUserId: mom1_mom_father.id,
    //   relation: TreeRelationType.MARRIED,
    // });

    // // ---SUBTREE -> HUSBAND BRANCH
    // const mom1_father_father = await userService.create(userFactory("m1_f_f"));
    // const mom1_father_mom = await userService.create(userFactory("m1_f_m"));
    // await treeService.join(mom1_father_fetched.myTreeIdByParent1, {
    //   relation: TreeRelationType.DESCENDANT,
    //   toUserId: mom1_father_father.id,
    //   userId: mom1_father.id,
    // });

    // await treeService.join(mom1_father_fetched.myTreeIdByParent1, {
    //   userId: mom1_father_mom.id,
    //   toUserId: mom1_father_father.id,
    //   relation: TreeRelationType.MARRIED,
    // });

    // // ----SUBTREE of SUBTREE in HUSBAND BRANCH
    // const mom1_father_mom_father = await userService.create(
    //   userFactory("m1_f_m_f")
    // );
    // const mom1_father_mom_mom = await userService.create(
    //   userFactory("m1_f_m_m")
    // );
    // const mom1_father_father_fetched: any = await userService.findOne(
    //   mom1_father_father.id
    // );

    // await treeService.join(mom1_father_father_fetched.myTreeIdByParent1, {
    //   relation: TreeRelationType.MARRIEDSUBTREE,
    //   userId: mom1_father_mom.id,
    //   toUserId: mom1_father_mom_father.id,
    // });

    // const mom1_father_mom_fetched: any = await userService.findOne(
    //   mom1_father_mom.id
    // );

    // await treeService.join(mom1_father_mom_fetched.myTreeIdByParent1, {
    //   userId: mom1_father_mom_mom.id,
    //   toUserId: mom1_father_mom_father.id,
    //   relation: TreeRelationType.MARRIED,
    // });

    // // ----CHILDREN OF CHILDREN
    // const child1_child = await userService.create(userFactory("c1_c"));
    // const child1_child2 = await userService.create(userFactory("c1_c2"));
    // const child1_child_spouse = await userService.create(
    //   userFactory("c1_c_sp")
    // );
    // const child1_child_child = await userService.create(userFactory("c1_c_c"));
    // const child1_child_child_spouse = await userService.create(
    //   userFactory("c1_c_c_sp")
    // );

    // //  add to tree in bottom
    // // {
    // // "userId": new user,
    // // "toUserId": user in main tree,
    // // "relation": "DESCENDANT"
    // // }
    // await treeService.join(tree_child1.id, {
    //   userId: child1_child.id,
    //   toUserId: child1.id,
    //   relation: TreeRelationType.DESCENDANT,
    // });

    // await treeService.join(tree_child1.id, {
    //   userId: child1_child2.id,
    //   toUserId: child1.id,
    //   relation: TreeRelationType.DESCENDANT,
    // });

    // await treeService.join(tree_child1.id, {
    //   userId: child1_child_child.id,
    //   toUserId: child1_child.id,
    //   relation: TreeRelationType.DESCENDANT,
    // });

    // await treeService.join(tree_child1.id, {
    //   userId: child1_child_spouse.id,
    //   toUserId: child1_child.id,
    //   relation: TreeRelationType.MARRIED,
    // });

    // await treeService.join(tree_child1.id, {
    //   userId: child1_child_child_spouse.id,
    //   toUserId: child1_child_child.id,
    //   relation: TreeRelationType.MARRIED,
    // });
  }, 999999999);

  it("should work for single user", async () => {
    const child1Params = userFactory("c1");
    const child1 = await userService.create(child1Params);
    expect(child1.email).toBe(child1Params.email);

    const tree_child1 = await treeService.create({
      name: child1.firstName,
      userId: child1.id,
    });

    expect(tree_child1).toBeDefined();

    const tree_result = await treeService.getTreeInPartsUserId(
      tree_child1.id,
      child1.id.toString()
    );

    expect(tree_result).toBeTruthy();
  }, 999999999);
});
