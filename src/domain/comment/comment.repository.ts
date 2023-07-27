import { BadRequestException, Inject, Injectable, Scope } from "@nestjs/common";
import { Connection } from "cypher-query-builder";
import * as cypher from "src/services/database/repository.utils";
import { ConfigService } from "@nestjs/config";
import {
  CUSTOM_ERROR_MESSAGE,
  DATABASE_CONNECTION,
} from "src/services/database/database.constants";
import { Comment } from "./entities/comment.entity";
import { UtilsRepository } from "src/utils/utils.repository";
import { ENTITY_TYPE_COMMENT, ENTITY_TYPE_POST } from "./comment.constants";
import { PostRepository } from "../post/post.repository";

@Injectable({ scope: Scope.REQUEST })
export class CommentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly postRepository: PostRepository
  ) {}

  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async addNewComment(commentData: any): Promise<Comment[]> {
    commentData.commentBody = UtilsRepository.getStringVersion(
      commentData?.commentBody
    );
    commentData.publishedById = +commentData.publishedById;
    const result = await this.query()
      .createEntity<{ [key in keyof Partial<Comment>]: any }>(
        "Comment",
        commentData
      )
      .commitWithReturnEntity();

    const entityForComment = await this.query()
      .findEntityById(
        commentData.commentForEntityType,
        commentData.commentForEntityId
      )
      .commitWithReturnEntity();

    let comments = [];
    if (commentData.commentForEntityType === ENTITY_TYPE_POST) {
      if (
        entityForComment?.data?.Post?.properties?.comments &&
        entityForComment?.data?.Post?.properties?.comments?.length
      ) {
        comments = entityForComment?.data?.Post?.properties?.comments;
        comments.push(+result?.data?.Comment?.identity);
      } else {
        comments = [+result.data.Comment.identity];
      }
      await this.postRepository.updatePostEntity(
        commentData.commentForEntityId,
        { comments: comments }
      );
    }

    if (commentData?.commentForEntityType === ENTITY_TYPE_COMMENT) {
      if (
        entityForComment?.data?.Comment?.properties?.comments &&
        entityForComment?.data?.Comment?.properties?.comments?.length
      ) {
        comments = entityForComment?.data?.Comment?.properties?.comments;
        comments.push(+result?.data?.Comment?.identity);
      } else {
        comments = [+result?.data?.Comment?.identity];
      }
      this.updateCommentEntity(commentData.commentForEntityId, {
        comments: comments,
      });
    }

    if (result) {
      const data = result.data;
      return {
        id: data.Comment.identity,
        ...data.Comment.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getCommentEntity(id: number): Promise<any> {
    const result = await this.query()
      .findEntityByIdWithUserOptionalMatch("Comment", id)
      .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return {
        id: data.Comment.identity,
        publishedByUser: data.User,
        ...data.Comment.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async getAllCommentsByIds(id: number, type: string): Promise<any> {
    const entityResult = await this.query()
      .findEntityById(type, id)
      .commitWithReturnEntity();
    let result = null;
    if (type === ENTITY_TYPE_COMMENT) {
      result = await this.query()
        .findEntityByIdsWithUsers(
          "Comment",
          entityResult.data.Comment.properties.comments
        )
        .commitWithReturnEntitiesRow();
    }
    if (type === ENTITY_TYPE_POST) {
      result = await this.query()
        .findEntityByIdsWithUsers(
          "Comment",
          entityResult.data.Post.properties.comments
        )
        .commitWithReturnEntitiesRow();
    }
    if (result) {
      return result[0].Comments;
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async deleteComment(id: number): Promise<any> {
    const result = await this.query()
      .deleteEntityById("Comment", id)
      .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return {
        response: "done",
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }

  async updateCommentEntity(commentId, commentParams): Promise<any> {
    const params = commentParams;
    const result = await this.query()
      .findEntityById("Comment", commentId)
      .updateEntity(
        "Comment",
        Object.entries({
          "Comment.commentType": params?.commentType,
          "Comment.commentBody": params?.commentBody,
          "Comment.comments": params?.comments,
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
        id: data.Comment.identity,
        ...data.Comment.properties,
      };
    }
    throw new BadRequestException(CUSTOM_ERROR_MESSAGE.DB_QUERY_ERROR);
  }
}
