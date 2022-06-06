declare const _default: (() => {
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    s3: {
        region: string;
    };
    env: {
        isLocal: boolean;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
    };
    s3: {
        region: string;
    };
    env: {
        isLocal: boolean;
    };
}>;
export default _default;
