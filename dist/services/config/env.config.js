"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('env_vars', () => ({
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    s3: {
        region: 'us-east-1',
    },
    env: {
        isLocal: process.env.NODE_ENV === 'local',
    },
}));
//# sourceMappingURL=env.config.js.map