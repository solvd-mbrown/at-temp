import {IRelative} from '~interfaces/IRelative';
import {AddRelativesActionSheetOptions} from '~types/AddRelativesActionSheetOptions';
import {TreePart} from '~types/TreePart';

import {TreeTypes, TreeMemberActionSheetOptions} from '~utils';

const getTreeMemberSpouseOptions = (
	isUserHasChildren: boolean,
	treeType: TreeTypes,
	isAlreadyHaveParents: boolean
): AddRelativesActionSheetOptions => {
	const options: AddRelativesActionSheetOptions = [];

	if (isUserHasChildren || isAlreadyHaveParents) {
		options.push(TreeMemberActionSheetOptions.ViewMembersTree);
	}

	if (
		treeType !== TreeTypes.FatherAncestryTreeLine &&
		treeType !== TreeTypes.MotherAncestryTreeLine
	) {
		if (!isAlreadyHaveParents) {
			options.push(TreeMemberActionSheetOptions.AddParent);
		}
		options.push(TreeMemberActionSheetOptions.AddChild);
	}

	return options;
};

const getRootTreeMemberActionSheetOptions = (
	treeType: TreeTypes,
	userSpouses: IRelative[],
	fatherTree: TreePart
): AddRelativesActionSheetOptions => {
	switch (treeType) {
		case TreeTypes.MainTree:
			// Means that tree has no user that should be rendered == there is not tree
			// (there will be only 1 user with no .user property & the same Id as Root user in bottom-main tree)

			// eslint-disable-next-line no-case-declarations
			const isFathersTreeEmpty: boolean = !fatherTree[0]?.user;
			// Root user with wife options
			if (userSpouses?.length > 0) {
				if (isFathersTreeEmpty) {
					return [TreeMemberActionSheetOptions.AddParent, TreeMemberActionSheetOptions.AddChild];
				} else {
					return [TreeMemberActionSheetOptions.AddChild];
				}
				// Root user without wife options
			} else {
				if (isFathersTreeEmpty) {
					return [
						TreeMemberActionSheetOptions.AddParent,
						TreeMemberActionSheetOptions.AddSpouse,
						TreeMemberActionSheetOptions.AddChild,
					];
				} else {
					return [TreeMemberActionSheetOptions.AddSpouse, TreeMemberActionSheetOptions.AddChild];
				}
			}
		case TreeTypes.FatherAncestryTreeLine:
		case TreeTypes.MotherAncestryTreeLine:
			if (userSpouses?.length > 0) {
				// Root user with wife options
				return [];
			} else {
				// Root user without wife options
				return [TreeMemberActionSheetOptions.AddSpouse];
			}
		default:
			return [TreeMemberActionSheetOptions.AddChild, TreeMemberActionSheetOptions.AddSpouse];
	}
};

const getDefaultTreeMemberOptions = (
	treeType: TreeTypes,
	userSpouses: IRelative[]
): AddRelativesActionSheetOptions => {
	switch (treeType) {
		case TreeTypes.FatherAncestryTreeLine:
		case TreeTypes.MotherAncestryTreeLine:
			if (userSpouses?.length > 0) {
				return [];
			} else {
				return [TreeMemberActionSheetOptions.AddSpouse];
			}
		default:
			if (userSpouses?.length > 0) {
				return [TreeMemberActionSheetOptions.AddChild];
			} else {
				return [TreeMemberActionSheetOptions.AddChild, TreeMemberActionSheetOptions.AddSpouse];
			}
	}
};

const getFinalTreeMemberOptions = (
	isUserHasChildren: boolean,
	basicOptions: AddRelativesActionSheetOptions,
	isAuthUser: boolean,
	isRoot: boolean,
	userSpouses: IRelative[],
	isTreeOwner?: boolean
): AddRelativesActionSheetOptions => {
	// * User can't be deleted if it has spouse
		return [TreeMemberActionSheetOptions.ViewMembersTree, ...basicOptions];
};

export {
	getRootTreeMemberActionSheetOptions,
	getDefaultTreeMemberOptions,
	getTreeMemberSpouseOptions,
	getFinalTreeMemberOptions,
};
