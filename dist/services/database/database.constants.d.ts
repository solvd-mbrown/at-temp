export declare const DATABASE_DRIVER = "DATABASE_DRIVER";
export declare const DATABASE_CONFIG = "DATABASE_CONFIG";
export declare const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export declare enum CUSTOM_ERROR_MESSAGE {
    ACTIVE_CAMPAIGN_SERVER_ERROR = "ACTIVE_CAMPAIGN_SERVER_ERROR",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    DB_QUERY_ERROR = "Couldn't resolve the query",
    INVALID_METHOD_INPUT = "INVALID_METHOD_INPUT",
    LEAVE_WORKSPACE_AS_CREATOR = "LEAVE_WORKSPACE_AS_CREATOR",
    NOT_AUTHORIZED = "Not Authorised!",
    NO_RELATION = "NO_RELATION",
    NOT_ALLOWED_ON_ARCHIVED = "NOT_ALLOWED_ON_ARCHIVED",
    NOT_ALLOWED_ON_YOURSELF = "NOT_ALLOWED_ON_YOURSELF"
}
export declare const CUSTOM_ERROR: {
    ACTIVE_CAMPAIGN_SERVER_ERROR: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    INSUFFICIENT_PERMISSIONS: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    INVALID_METHOD_INPUT: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    LEAVE_WORKSPACE_AS_CREATOR: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    NOT_AUTHORIZED: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    NO_RELATION: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    NOT_ALLOWED_ON_YOURSELF: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
    NOT_ALLOWED_ON_ARCHIVED: {
        message: CUSTOM_ERROR_MESSAGE;
        code: number;
    };
};
