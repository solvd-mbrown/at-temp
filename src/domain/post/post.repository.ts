import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { Connection } from 'cypher-query-builder';
import * as cypher from 'src/services/database/repository.utils';
import { ConfigService } from '@nestjs/config';
import { DATABASE_CONNECTION } from 'src/services/database/database.constants';
import { Post } from './entities/post.entity';
import { UtilsRepository } from 'src/utils/utils.repository';


@Injectable({ scope: Scope.REQUEST })
export class PostRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
  }

  private query(): cypher.RepositoryQuery {
    return new cypher.RepositoryQuery(this.connection);
  }

  async getPostEntity(id: number): Promise<any> {
    const result = await this.query()
    .findEntityById('Post', id)
    .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return {
        id: data.Post.identity,
        ...data.Post.properties,
      };
    }
  }

  async getAllPostsByTreeUUID(uuid: string): Promise<any> {
    const treeUUID = UtilsRepository.getStringVersion(uuid);
    const result = await this.query()
    .fetchAllByEntityUUUID(treeUUID, 'Post')
    .commitWithReturnEntities();
    if (result) {
      return result.map(({ data }) => {
        const result = data;
        return {
          id: result.Post.identity,
          ...result.Post.properties,
        };
      });
    }
  }

  async findAllByUserId(id: string): Promise<any> {
    const result = await this.query()
    .findAllPostsByUserId(id, 'Post')
    .commitWithReturnEntities();
    if (result) {
      return result.map(({ data }) => {
        const result = data;
        return {
          id: result.Post.identity,
          ...result.Post.properties,
        };
      });
    }
  }


  async addNewPost(PostData: any): Promise<Post[]> {
    const result = await this.query()
    .createEntity<{ [key in keyof Partial<Post>]: any }>('Post',
      PostData
    )
    .commitWithReturnEntity();

    if (result) {
      const data = result.data;

      return {
        id: data.Post.identity,
        ...data.Post.properties,
      };
    }
  }

  async deletePost(id: number): Promise<any> {
    const result = await this.query()
    .deleteEntityById('Post', id)
    .commitWithReturnEntity();
    if (result) {
      const data = result.data;
      return  {
        "response": "done"
      };
    }
  }

  async updatePostEntity(
    postId,
    postParams,
  ): Promise<any> {
    const params = postParams;
    // @ts-ignore
    const result = await this.query()
    .findEntityById('Post', postId)
    .updateEntity(
      'Post',
      Object.entries({
        'Post.postType': params?.postType,
        'Post.postBody': params?.postBody,
        'Post.comments': params?.comments,
        // 'Post.comments': params?.comments ? UtilsRepository.getStringVersion(params?.comments) : null,
      }).reduce((valuesAcc, [key, value]) => {
        return value !== undefined && value !== null
          ? {
            ...valuesAcc,
            [key]: value,
          }
          : valuesAcc;
      }, {}),
    )
    .commitWithReturnEntity();

    if (result !== null) {
      const data = result.data;
      return {
        id: data.Post.identity,
        ...data.Post.properties,
      };
    }
  }



}