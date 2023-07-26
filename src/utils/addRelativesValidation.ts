import {AddRelativesActionSheetOptions} from '~types/AddRelativesActionSheetOptions';
import {UserRelatives} from '~types/UserRelatives';

import {TreeMemberActionSheetOptions} from './enums';

const canAddSpouse = (userFamily: UserRelatives | undefined): boolean =>
	userFamily?.spouse === null;

const canAddParents = (userFamily: UserRelatives | undefined): boolean | undefined => {
	// eslint-disable-next-line no-undefined
	if (userFamily?.parents !== undefined) {
		return userFamily?.parents === null || (userFamily?.parents && userFamily?.parents.length > 2);
	}
};

const canAddSiblings = (userFamily: UserRelatives | undefined): boolean | undefined => {
	if (userFamily?.parents) return userFamily.parents.length > 0;
};

const getAddRelativesActionSheetOptions = (
	userFamily: UserRelatives
): AddRelativesActionSheetOptions => {
	const options: AddRelativesActionSheetOptions = [TreeMemberActionSheetOptions.AddChild];
	if (canAddSpouse(userFamily)) {
		options.push(TreeMemberActionSheetOptions.AddSpouse);
	}
	if (canAddParents(userFamily)) {
		options.push(TreeMemberActionSheetOptions.AddParent);
	}
	if (canAddSiblings(userFamily)) {
		options.push(TreeMemberActionSheetOptions.AddSiblings);
	}
	options.push('Cancel');
	return options;
};

export {getAddRelativesActionSheetOptions};
