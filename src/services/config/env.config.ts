import { registerAs } from '@nestjs/config';

export default registerAs('env_vars', () => ({
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
