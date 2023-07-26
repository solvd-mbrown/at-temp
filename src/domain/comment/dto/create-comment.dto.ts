export class CreateCommentDto {
  commentForEntityType: string;
  commentForEntityId: number;
  publishedById: number;
  commentType: string;
  commentBody: string;
}
