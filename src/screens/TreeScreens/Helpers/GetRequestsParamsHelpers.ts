import {TreeMemberActionSheetOptions} from '~utils';

export const getGetTreeInPartsByIdAsyncUserIdOfAuthUserTreeParamHelper = (
	rootUserId: string,
	authUserId: string,
	newUserRoleInTheTreeForSelectedUser: TreeMemberActionSheetOptions,
	isRootHasChildren: boolean,
	firstRootChildIdentity: string
) => {
	if (
		// Is Auth user Root
		rootUserId === authUserId &&
		newUserRoleInTheTreeForSelectedUser === TreeMemberActionSheetOptions.AddParent
	) {
		return authUserId;
	}
	if (isRootHasChildren) {
		return firstRootChildIdentity;
	}
	return rootUserId || authUserId;
};
