type Nullable<T> = T | null;

export class Comment {
  __typename?: 'Comment';
  id: number;
  commentForEntityType: string;
  commentForEntityId: string;
  publishedById: string;
  commentType: Nullable<string>;
  commentBody: Nullable<string>;
  comments?: Nullable<[string]>;
  createDate?: Nullable<string>;
  updateDate?: Nullable<string>;
}