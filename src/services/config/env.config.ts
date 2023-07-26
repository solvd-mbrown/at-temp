import { registerAs } from "@nestjs/config";

export default registerAs("env_vars", () => ({
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
  email: {
    address: process.env.EMAIL_PROVIDER_ADDRESS,
    password: process.env.EMAIL_PROVIDER_PASSWORD,
  },
  env: {
    isLocal: process.env.NODE_ENV === "local",
  },
  s3: {
    region: "us-east-1",
  },
}));
