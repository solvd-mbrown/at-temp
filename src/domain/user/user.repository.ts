import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { Connection } from "cypher-query-builder";
import * as cypher from "src/services/database/repository.utils";
import { ConfigService } from "@nestjs/config";
import {
  CUSTOM_ERROR_MESSAGE,
  DATABASE_CONNECTION,
} from "src/services/database/database.constants";
import { User } from "./entities/user.entity";
import { UtilsRepository } from "src/utils/utils.repository";

@Injectable({ scope: Scope.REQUEST })
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService
  ) {}
  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async addNewUser(userData: any): Promise<User> {
    const result = await this.query()
      .createEntity<{ [key in keyof Partial<User>]: any }>("User", userData)
      .commitWithReturnEntity();

    if (result) {
      const data = result.data;

      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async deleteUser(id: number): Promise<any> {
    const result = await this.query()
      .deleteEntityById("User", id)
      .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getUserEntity(id: number): Promise<any> {
    const result = await this.query()
      .fetchUserByUserId(id)
      .commitWithReturnEntity();

    const parent = await this.query()
      .fetchUserByUserId(id)
      .resolveUsersParentsByRelation(
        result.data.User.properties.myTreeIdByParent1
      )
      .commitWithReturnEntities();
    let parents = [];
    if (parent && parent?.length && parent[0].data.UserP) {
      parents.push(parent[0].data.UserP);
      if (parent[0].data.UserM) {
        parents.push(parent[0].data.UserM);
      }
    }

    const spouses = await this.query()
      .fetchUserByUserId(id)
      .resolveUsersSpouseByRelationByTreeId(
        result.data.User.properties.myTreeIdByParent1
      )
      .commitWithReturnEntities();
    let spouse = [];
    if (spouses && spouses?.length && spouses[0].data.UserS) {
      spouse.push(spouses[0].data.UserS);
    }

    let siblings = [];
    if (parent && parent?.length && parent[0].data.UserP) {
      const siblingsArr = await this.query()
        .fetchUserByUserId(parent[0].data.UserP.identity)
        .resolveUsersChildrenByRelation(
          parent[0].data.UserP.properties.myTreeIdByParent1
        )
        .commitWithReturnEntities();

      if (siblingsArr && siblingsArr?.length && siblingsArr[0].data.UserKList) {
        let famalyLine = siblingsArr[0].data.UserKList;
        if (famalyLine.length > 1) {
          famalyLine = famalyLine.filter((object) => {
            return object.identity != id;
          });
          siblings = famalyLine;
        }
      }
    }

    const childrens = await this.query()
      .fetchUserByUserId(id)
      .resolveUsersChildrenByRelation(
        result.data.User.properties.myTreeIdByParent1
      )
      .commitWithReturnEntities();

    let kids = [];
    if (childrens && childrens.length && childrens[0].data.UserKList) {
      kids = childrens[0].data.UserKList;
    }

    if (
      !childrens[0].data.UserKList.length &&
      spouses &&
      spouses[0].data.UserS
    ) {
      const spouseChildrens = await this.query()
        .fetchUserByUserId(spouses[0].data.UserS.identity)
        .resolveUsersChildrenByRelation(
          spouses[0].data.UserS.properties.myTreeIdByParent1
        )
        .commitWithReturnEntities();

      if (
        spouseChildrens &&
        spouseChildrens.length &&
        spouseChildrens[0].data.UserKList
      ) {
        kids = spouseChildrens[0].data.UserKList;
      }
    }

    if (result) {
      const data = result.data;
      data.User.properties.parents = parents.length ? parents : null;
      data.User.properties.siblings = siblings.length ? siblings : null;
      data.User.properties.spouse = spouse.length ? spouse : null;
      data.User.properties.kids = kids.length ? kids : null;
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async updateUserEntity(userId, userParams): Promise<any> {
    const params = userParams;
    // @ts-ignore
    const result = await this.query()
      .fetchUserByUserId(userId)
      .updateEntity(
        "User",
        Object.entries({
          "User.userPictureLink": params?.userPictureLink,
          "User.userPictureKey": params?.userPictureKey,
          "User.firstName": params?.firstName,
          "User.maidenName": params?.maidenName,
          "User.lastName": params?.lastName,
          "User.introduction": params?.introduction
            ? UtilsRepository.getStringVersion(params?.introduction)
            : null,
          "User.setting": params?.setting
            ? UtilsRepository.getStringVersion(params?.setting)
            : null,
          "User.birthdate": params?.birthdate,
          "User.dateOfDeath": params?.dateOfDeath,
          "User.isDeceased": params?.isDeceased,
          "User.isActivated": params?.isActivated,
          "User.gender": params?.gender,
          "User.hometown": params?.hometown,
          "User.homeCountry": params?.homeCountry,
          "User.email": params?.email,
          "User.phone": params?.phone,
          "User.address": params?.address,
          "User.spouseTreeId": params?.spouseTreeId,
          "User.myTreeIdByParent1": params?.myTreeIdByParent1,
          "User.myTreeIdByParent2": params?.myTreeIdByParent2,
          "User.storageFolderId": params?.storageFolderId,
          "User.spouse": params?.spouse
            ? UtilsRepository.getStringVersion(params?.spouse)
            : null,
          "User.kids": params?.kids
            ? UtilsRepository.getStringVersion(params?.kids)
            : null,
          "User.parents": params?.parents
            ? UtilsRepository.getStringVersion(params?.parents)
            : null,
          "User.siblings": params?.siblings
            ? UtilsRepository.getStringVersion(params?.siblings)
            : null,
          "User.socialNetworks": params?.socialNetworks
            ? UtilsRepository.getStringVersion(params?.socialNetworks)
            : null,
          "User.work": params?.work
            ? UtilsRepository.getStringVersion(params?.work)
            : null,
          "User.education": params?.education
            ? UtilsRepository.getStringVersion(params?.education)
            : null,
        }).reduce((valuesAcc, [key, value]) => {
          return value !== undefined && value !== null
            ? {
                ...valuesAcc,
                [key]: value,
              }
            : valuesAcc;
        }, {})
      )
      .commitWithReturnEntity();

    if (result !== null) {
      const data = result.data;
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  /*
   * Get User Entity from email
   */
  public async getUserFromEmail(email: string): Promise<User> {
    const result = await this.query()
      .findUserByEmail(email)
      .commitWithReturnEntity();

    if (result) {
      const data = result.data;
      return {
        id: data.User.identity,
        ...data.User.properties,
      };
    }
  }

  public async getUsersWithStorageFileId(): Promise<User[]> {
    const result = await this.query()
      .raw(
        `MATCH(User:User)
    WHERE User.storageFolderId IS NOT NULL
    RETURN COLLECT(User{.*, id: id(User)}) as Users`
      )
      .commit();

    if (result[0]?.Users) {
      return result[0]?.Users as User[];
    }
    return null;
  }
}
