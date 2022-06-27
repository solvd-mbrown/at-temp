import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TreeController } from './domain/tree/tree.controller';
import { TreeService } from './domain/tree/tree.service';
import { UserController } from './domain/user/user.controller';
import { UserModule } from './domain/user/user.module';
import { UserService } from './domain/user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  createDatabaseConfiguration,
  DatabaseModule,
} from './services/database/database.module';
import { DatabaseCypherModule } from './services/database/database.cypher.module';
import configuration from 'src/services/config/env.config';
import { DatabaseConfig } from './services/database/database.service';
import { UserRepository } from './domain/user/user.repository';
import { TreeRepository } from './domain/tree/tree.repository';
import { FileService } from './domain/file/file.service';
import { FileController } from './domain/file/file.controller';
import { PostController } from './domain/post/post.controller';
import { PostService } from './domain/post/post.service';
import { PostRepository } from './domain/post/post.repository';
import { CommentController } from './domain/comment/comment.controller';
import { CommentRepository } from './domain/comment/comment.repository';
import { CommentService } from './domain/comment/comment.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/env/.env.${process.env.NODE_ENV || 'local'}`,
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseCypherModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<DatabaseConfig> => {
        return createDatabaseConfiguration(configService);
      },
    }),
    DatabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DatabaseConfig =>
        createDatabaseConfiguration(configService),
    }),
  ],
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
})
export class AppModule {}
