import { NestApplication } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "src/app.controller";
import { AppModule } from "src/app.module";
import { AppService } from "src/app.service";
import { FirebaseAuthStrategy } from "src/services/auth/firebase/firebase-auth.strategy";
import { DatabaseModule } from "src/services/database/database.module";
import { DatabaseService } from "src/services/database/database.service";
import { CommentController } from "../comment/comment.controller";
import { CommentRepository } from "../comment/comment.repository";
import { CommentService } from "../comment/comment.service";
import { FileController } from "../file/file.controller";
import { FileService } from "../file/file.service";
import { PostController } from "../post/post.controller";
import { PostRepository } from "../post/post.repository";
import { PostService } from "../post/post.service";
import { UserController } from "../user/user.controller";
import { UserRepository } from "../user/user.repository";
import { UserService } from "../user/user.service";
import { TreeController } from "./tree.controller";
import { TreeRepository } from "./tree.repository";
import { TreeService } from "./tree.service";

describe("TreeService", () => {
  let db;
  let app: NestApplication;
  let service: TreeService;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule, DatabaseModule],
        controllers: [
          AppController,
          UserController,
          TreeController,
          FileController,
          PostController,
          CommentController,
        ],
        providers: [
          AppService,
          UserService,
          UserRepository,
          TreeService,
          TreeRepository,
          FileService,
          PostService,
          PostRepository,
          CommentService,
          CommentRepository,
        ],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();
      db = moduleFixture.get<DatabaseService>(DatabaseService);
    } catch (e) {
      throw Error(e);
    }
  });

  it("should be defined", () => {
    expect(db).toBeDefined();
  });
});
