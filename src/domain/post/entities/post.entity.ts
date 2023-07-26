type Nullable<T> = T | null;

export class Post {
  __typename?: 'Post';
  id: number;
  treeUUID: string;
  publishedById: number;
  postType?: Nullable<string>;
  postBody?: Nullable<string>;
  comments?: Nullable<string>;
  createDate?: Nullable<string>;
  updateDate?: Nullable<string>;
}