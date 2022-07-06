import {
  MethodNotAllowedException,
  UnauthorizedException,
} from '@nestjs/common';

export const DATABASE_DRIVER = 'DATABASE_DRIVER';
export const DATABASE_CONFIG = 'DATABASE_CONFIG';
export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export enum CUSTOM_ERROR_MESSAGE {
  ACTIVE_CAMPAIGN_SERVER_ERROR = 'ACTIVE_CAMPAIGN_SERVER_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  DB_QUERY_ERROR = `Couldn't resolve the query`,
  INVALID_METHOD_INPUT = 'INVALID_METHOD_INPUT',
  LEAVE_WORKSPACE_AS_CREATOR = 'LEAVE_WORKSPACE_AS_CREATOR',
  NOT_AUTHORIZED = 'Not Authorised!',
  NO_RELATION = 'NO_RELATION',
  NOT_ALLOWED_ON_ARCHIVED = 'NOT_ALLOWED_ON_ARCHIVED',
  NOT_ALLOWED_ON_YOURSELF = 'NOT_ALLOWED_ON_YOURSELF',
}

export const CUSTOM_ERROR = {
  ACTIVE_CAMPAIGN_SERVER_ERROR: {
    message: CUSTOM_ERROR_MESSAGE.ACTIVE_CAMPAIGN_SERVER_ERROR,
    code: 404,
  },
  INSUFFICIENT_PERMISSIONS: {
    message: CUSTOM_ERROR_MESSAGE.INSUFFICIENT_PERMISSIONS,
    code: 405,
  },
  INVALID_METHOD_INPUT: {
    message: CUSTOM_ERROR_MESSAGE.INVALID_METHOD_INPUT,
    code: 402,
  },
  LEAVE_WORKSPACE_AS_CREATOR: {
    message: CUSTOM_ERROR_MESSAGE.LEAVE_WORKSPACE_AS_CREATOR,
    code: 405,
  },
  NOT_AUTHORIZED: {
    message: CUSTOM_ERROR_MESSAGE.NOT_AUTHORIZED,
    code: 401,
  },
  NO_RELATION: {
    message: CUSTOM_ERROR_MESSAGE.NO_RELATION,
    code: 405,
  },
  NOT_ALLOWED_ON_YOURSELF: {
    message: CUSTOM_ERROR_MESSAGE.NOT_ALLOWED_ON_YOURSELF,
    code: 405,
  },
  NOT_ALLOWED_ON_ARCHIVED: {
    message: CUSTOM_ERROR_MESSAGE.NOT_ALLOWED_ON_ARCHIVED,
    code: 402,
  },
};