import {ITreeMemberDescendant} from '~interfaces/ITreeMemberDescendant';
import {IRelative} from '~interfaces/IRelative';
import {QuestionnaireSettings} from '~types/QuestionnaireSettings';

import {QuestionnaireCases, TreeMemberActionSheetOptions, TreeRelations} from '~utils';

export type UserData = {
	firstName?: string;
	lastName?: string;
	gender?: string;
	email: string;
	setting: QuestionnaireSettings | string;
};

export type CreateUserPayload = {
	userData: UserData;
	shouldSaveAsAuthUser?: boolean;
};

export type AuthData = {
	id: string;
	lastName: string;
	firstName: string;
	updateDate: number;
	birthdate: string;
	myTreeIdByParent1: string;
	gender: string;
	isActivated: boolean;
	treeOwner: boolean;
	email: string;
	createDate: number;
	setting: QuestionnaireSettings | string;
};

export type UpdateUserByIdPayload = {
	userId: string;
	userData: any;
	isSignUp?: boolean;
	settings?: QuestionnaireSettings | string;
	callback?: () => void;
};

export type GetTreeInPartsByIdAsyncPayload = {
	treeId: string;
	userId: string;
};

export type UpdateTreeByIdAsyncPayload = {
	treeId: string;
	toUserId: string;
	newUserId: string;
	roleType: string;
	isRootUser: boolean;
	isWifeOfRootUser: boolean;
	treeMemberThatHoldsChildren?: ITreeMemberDescendant | null;
};

export type InitializeTreeData = {
	userId: string;
	name: string;
};

export type CreateRelativeAsyncPayload = {
	userId: string;
	authUserId?: string;
	treeId: string;
	parents?: IRelative[];
	newRelativeData: {
		firstName: string;
		lastName: string;
		gender: string;
		email: string;
		isDeceased?: boolean;
		dateOfDeath?: string;
		anniversaryDate?: string;
		birthdate: string;
		userPictureLink?: string;
	};
	addRelativeViaModal?: boolean;
	treeRelation?: TreeRelations;
	questionnaireCase?: QuestionnaireCases;
	setting: any;
};

export type AddRelativesByTreeIdAsyncPayload = {
	treeId: string;
	userId: string;
	newUserId: string;
	addRelativeActionSheetOption: TreeMemberActionSheetOptions;
	parents?: IRelative[];
	questionnaireCase?: QuestionnaireCases | null;
	addRelativeViaModal?: boolean;
};

export type CreatePostAsyncPayload = {
	userId?: string;
	treeId?: string;
	postType?: string;
	postBody: any;
};

export type UpdatePostByIdAsyncPayload = {
	postId?: string;
	userId?: string;
	postBody: any;
	comments?: number[];
};

export type CreateCommentAsyncPayload = {
	userId: string;
	entityId?: string;
	entityType: string;
	commentType: string;
	commentData: {
		text: string;
	};
};

export type UpdateCommentByIdAsyncPayload = {
	commentId: string;
	userId: string;
	entityId: string;
	entityType: string;
	commentType: string;
	commentData: {
		text: string;
	};
};

export type DeleteCommentByIdAsyncPayload = {
	commentId: string;
	postId: string;
	postAuthorId: string;
	updatedPostBody: any;
	commentsIdThatShouldDelete: number[];
};
