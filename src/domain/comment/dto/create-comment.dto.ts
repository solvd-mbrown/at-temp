export class CreateCommentDto {
  commentForEntityType: string;
  commentForEntityId: string;
  publishedById: string;
  commentType: string;
  commentBody: string;
}
