"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const tree_controller_1 = require("./domain/tree/tree.controller");
const tree_service_1 = require("./domain/tree/tree.service");
const user_controller_1 = require("./domain/user/user.controller");
const user_service_1 = require("./domain/user/user.service");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./services/database/database.module");
const database_cypher_module_1 = require("./services/database/database.cypher.module");
const env_config_1 = require("./services/config/env.config");
const user_repository_1 = require("./domain/user/user.repository");
const tree_repository_1 = require("./domain/tree/tree.repository");
const file_service_1 = require("./domain/file/file.service");
const file_controller_1 = require("./domain/file/file.controller");
const post_controller_1 = require("./domain/post/post.controller");
const post_service_1 = require("./domain/post/post.service");
const post_repository_1 = require("./domain/post/post.repository");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: `src/env/.env.${process.env.NODE_ENV || 'local'}`,
                isGlobal: true,
                load: [env_config_1.default],
            }),
            database_cypher_module_1.DatabaseCypherModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => {
                    return (0, database_module_1.createDatabaseConfiguration)(configService);
                },
            }),
            database_module_1.DatabaseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, database_module_1.createDatabaseConfiguration)(configService),
            }),
        ],
        controllers: [
            app_controller_1.AppController,
            user_controller_1.UserController,
            tree_controller_1.TreeController,
            file_controller_1.FileController,
            post_controller_1.PostController,
        ],
        providers: [
            app_service_1.AppService,
            user_service_1.UserService,
            user_repository_1.UserRepository,
            tree_service_1.TreeService,
            tree_repository_1.TreeRepository,
            file_service_1.FileService,
            post_service_1.PostService,
            post_repository_1.PostRepository,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map