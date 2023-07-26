import { FirebaseAdminModuleOptions } from './auth.module';
import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIREBASE_ADMIN_MODULE_OPTIONS } from './firebase/firebase.constants';
import { app } from 'firebase-admin';

@Injectable()

// @ts-ignore
export class FirebaseAuthenticationService implements admin.auth.Auth {
  app: app.App;
  constructor(
    @Inject(FIREBASE_ADMIN_MODULE_OPTIONS)
    private readonly config: FirebaseAdminModuleOptions,
  ) {
    this.app =
      admin.apps.length === 0
        ? admin.initializeApp(this.config)
        : admin.apps[0];
  }

  get auth() {
    if (!this.app) {
      throw new Error('Firebase instance is undefined.');
    }
    return this.app.auth();
  }

  tenantManager(): admin.auth.TenantManager {
    return this.auth.tenantManager();
  }
  createCustomToken(uid: string, developerClaims?: any): Promise<string> {
    return this.auth.createCustomToken(uid, developerClaims);
  }
  createUser(
    properties: admin.auth.CreateRequest,
  ): Promise<admin.auth.UserRecord> {
    return this.auth.createUser(properties);
  }
  deleteUser(uid: string): Promise<void> {
    return this.auth.deleteUser(uid);
  }
  deleteUsers(uids: string[]): Promise<admin.auth.DeleteUsersResult> {
    return this.auth.deleteUsers(uids);
  }
  getUser(uid: string): Promise<admin.auth.UserRecord> {
    return this.auth.getUser(uid);
  }
  getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    return this.auth.getUserByEmail(email);
  }
  async getOrCreateUsersByEmail(
    emails: string[],
  ): Promise<admin.auth.UserRecord[]> {
    const getPromise = emails.map((email) => this.getUserByEmail(email));
    let existingUsers = await (Promise as any).allSettled(getPromise);
    existingUsers = existingUsers
      .filter((user: any) => user?.status === 'fulfilled')
      .map((user: any) => user?.value);
    const existingEmails = existingUsers.map((user: any) => user.email);
    const usersToCreate = emails.filter(
      (email) => !existingEmails.includes(email),
    );
    const toCreatePromise = usersToCreate.map((email) =>
      this.createUser({ email }),
    );
    let newUsers = await (Promise as any).allSettled(toCreatePromise);
    newUsers = newUsers
      .filter((user: any) => user?.status === 'fulfilled')
      .map((user: any) => user?.value);

    return [...existingUsers, ...newUsers] as any;
  }
  getUserByPhoneNumber(phoneNumber: string): Promise<admin.auth.UserRecord> {
    return this.auth.getUserByPhoneNumber(phoneNumber);
  }
  getUserByProviderUid(
    providerId: string,
    uid: string,
  ): Promise<admin.auth.UserRecord> {
    return this.auth.getUserByProviderUid(providerId, uid);
  }
  getUsers(
    identifiers: admin.auth.UserRecord[],
  ): Promise<admin.auth.GetUsersResult> {
    return this.auth.getUsers(identifiers);
  }
  listUsers(
    maxResults?: number,
    pageToken?: string,
  ): Promise<admin.auth.ListUsersResult> {
    return this.auth.listUsers(maxResults, pageToken);
  }
  updateUser(
    uid: string,
    properties: admin.auth.UpdateRequest,
  ): Promise<admin.auth.UserRecord> {
    return this.auth.updateUser(uid, properties);
  }
  verifyIdToken(
    idToken: string,
    checkRevoked?: boolean,
  ): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(idToken, checkRevoked);
  }
  setCustomUserClaims(uid: string, customUserClaims: any): Promise<void> {
    return this.auth.setCustomUserClaims(uid, customUserClaims);
  }
  revokeRefreshTokens(uid: string): Promise<void> {
    return this.auth.revokeRefreshTokens(uid);
  }
  importUsers(
    users: admin.auth.UserImportRecord[],
    options?: admin.auth.UserImportOptions,
  ): Promise<admin.auth.UserImportResult> {
    return this.auth.importUsers(users, options);
  }
  createSessionCookie(
    idToken: string,
    sessionCookieOptions: admin.auth.SessionCookieOptions,
  ): Promise<string> {
    return this.auth.createSessionCookie(idToken, sessionCookieOptions);
  }
  verifySessionCookie(
    sessionCookie: string,
    checkForRevocation?: boolean,
  ): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifySessionCookie(sessionCookie, checkForRevocation);
  }
  generatePasswordResetLink(
    email: string,
    actionCodeSettings?: admin.auth.ActionCodeSettings,
  ): Promise<string> {
    return this.auth.generatePasswordResetLink(email, actionCodeSettings);
  }
  generateEmailVerificationLink(
    email: string,
    actionCodeSettings?: admin.auth.ActionCodeSettings,
  ): Promise<string> {
    return this.auth.generateEmailVerificationLink(email, actionCodeSettings);
  }
  generateSignInWithEmailLink(
    email: string,
    actionCodeSettings: admin.auth.ActionCodeSettings,
  ): Promise<string> {
    return this.auth.generateSignInWithEmailLink(email, actionCodeSettings);
  }
  listProviderConfigs(
    options: admin.auth.AuthProviderConfigFilter,
  ): Promise<admin.auth.ListProviderConfigResults> {
    return this.auth.listProviderConfigs(options);
  }
  getProviderConfig(
    providerId: string,
  ): Promise<admin.auth.AuthProviderConfig> {
    return this.auth.getProviderConfig(providerId);
  }
  deleteProviderConfig(providerId: string): Promise<void> {
    return this.auth.deleteProviderConfig(providerId);
  }
  updateProviderConfig(
    providerId: string,
    updatedConfig: admin.auth.UpdateAuthProviderRequest,
  ): Promise<admin.auth.AuthProviderConfig> {
    return this.auth.updateProviderConfig(providerId, updatedConfig);
  }
  createProviderConfig(
    config: admin.auth.AuthProviderConfig,
  ): Promise<admin.auth.AuthProviderConfig> {
    return this.auth.createProviderConfig(config);
  }
}
