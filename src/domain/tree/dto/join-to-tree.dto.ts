import { TreeRelationType } from "../tree.constants";

export class JoinToTreeDto {
  userId: number;
  relation: TreeRelationType;
  toUserId: number;
}
