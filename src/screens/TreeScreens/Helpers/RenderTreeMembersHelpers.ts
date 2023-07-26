import {TreePart} from '~types/TreePart';
import {IRelative} from '~interfaces/IRelative';
import {ITreeMemberDescendant} from '~interfaces/ITreeMemberDescendant';

import {capitalizeFirstLetter, TreeTypes} from '~utils';

const isRootMember = (memberId: string, rootTreeMemberId: string): boolean =>
	memberId === rootTreeMemberId;

const hasChildren = (member: ITreeMemberDescendant): boolean => member?.descendant?.length > 0;

const isMarried = (member: ITreeMemberDescendant): boolean => member?.married?.length > 0;

// if descendant return true
const isDescendantOrSpouse = (member: ITreeMemberDescendant, memberId: string): boolean =>
	member?.user && memberId === member?.user?.identity;

// * Male always on the right side, female always on the left side
const renderDescendantNameDependingOnGender = (userItem: ITreeMemberDescendant): string => {
	switch (capitalizeFirstLetter(userItem?.user?.properties?.gender)) {
		case 'Male':
			return userItem?.user?.properties?.firstName;
		case 'Female':
			if (
				isMarried(userItem) &&
				capitalizeFirstLetter(userItem?.married[0]?.properties?.gender) === 'Female'
			) {
				return userItem?.user?.properties?.firstName;
			} else if (isMarried(userItem)) {
				return userItem?.married[0]?.properties?.firstName;
			} else {
				return userItem?.user?.properties?.firstName;
			}
		default:
			if (capitalizeFirstLetter(userItem?.married[0]?.properties?.gender) === 'Male') {
				return userItem?.married[0]?.properties?.firstName;
			} else {
				return userItem?.user?.properties?.firstName;
			}
	}
};

const renderDescendantAvatarDependingOnGender = (
	userItem: ITreeMemberDescendant
): string | null => {
	switch (capitalizeFirstLetter(userItem?.user?.properties?.gender)) {
		case 'Male':
			return userItem?.user?.properties?.userPictureLink
				? userItem?.user?.properties?.userPictureLink
				: null;
		case 'Female':
			if (capitalizeFirstLetter(userItem?.married[0]?.properties?.gender) === 'Female') {
				return userItem?.user?.properties?.userPictureLink
					? userItem?.user?.properties?.userPictureLink
					: null;
			} else if (isMarried(userItem)) {
				return userItem?.married[0]?.properties?.userPictureLink
					? userItem?.married[0]?.properties?.userPictureLink
					: null;
			} else {
				return userItem?.user?.properties?.userPictureLink
					? userItem?.user?.properties?.userPictureLink
					: null;
			}
		default:
			// return userItem?.user?.properties?.userPictureLink
			// ? userItem?.user?.properties?.userPictureLink
			// : noGenderAvatarImageURL;
			if (capitalizeFirstLetter(userItem?.married[0]?.properties?.gender) === 'Male') {
				return userItem?.married[0]?.properties?.userPictureLink
					? userItem?.married[0]?.properties?.userPictureLink
					: null;
			} else {
				return userItem?.user?.properties?.userPictureLink
					? userItem?.user?.properties?.userPictureLink
					: null;
			}
	}
};

const renderSpouseNameDependingOnGender = (
	spouseItem: IRelative,
	userItem: ITreeMemberDescendant
): string => {
	switch (capitalizeFirstLetter(spouseItem?.properties?.gender)) {
		case 'Male':
			if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Female') {
				return userItem?.user?.properties?.firstName;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Non-binary') {
				if (capitalizeFirstLetter(spouseItem?.properties?.gender) === 'Male') {
					return userItem?.user?.properties?.firstName;
				}
				return spouseItem?.properties?.firstName;
			} else {
				//withm + m2
				return spouseItem?.properties?.firstName;
				//without m + m2
				// return userItem?.user?.properties?.firstName;
			}
		case 'Female':
			return spouseItem?.properties?.firstName;
		default:
			// return spouseItem?.properties?.firstName;
			if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Female') {
				return userItem?.user?.properties?.firstName;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Non-binary') {
				//before nb + nb 2

				// return userItem?.user?.properties?.firstName;
				//after nb + nb2

				return spouseItem?.properties?.firstName;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Male') {
				return spouseItem?.properties?.firstName;
				// return spouseItem?.properties?.firstName
			} else {
				// return spouseItem?.properties?.firstName;
				return userItem?.user?.properties?.firstName;
			}
	}
};

const renderSpouseAvatarDependingOnGender = (
	spouseItem: IRelative,
	userItem: ITreeMemberDescendant
): string | null => {
	switch (capitalizeFirstLetter(spouseItem?.properties?.gender)) {
		case 'Male':
			if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Female') {
				return userItem?.user?.properties?.userPictureLink
					? userItem?.user?.properties?.userPictureLink
					: null;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Non-binary') {
				if (capitalizeFirstLetter(spouseItem?.properties?.gender) === 'Male') {
					return userItem?.user?.properties?.userPictureLink
						? userItem?.user?.properties?.userPictureLink
						: null;
				} else {
					return spouseItem?.properties?.userPictureLink
						? spouseItem?.properties?.userPictureLink
						: null;
				}
			} else {
				// return userItem?.user?.properties?.userPictureLink
				// 	? userItem?.user?.properties?.userPictureLink
				// 	: noGenderAvatarImageURL;
				return spouseItem?.properties?.userPictureLink
					? spouseItem?.properties?.userPictureLink
					: null;
			}
		case 'Female':
			return spouseItem?.properties?.userPictureLink
				? spouseItem?.properties?.userPictureLink
				: null;
		default:
			// return spouseItem?.properties?.userPictureLink
			//   ? spouseItem?.properties?.userPictureLink
			//   : noGenderAvatarImageURL;
			if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Female') {
				return userItem?.user?.properties?.userPictureLink
					? userItem?.user?.properties?.userPictureLink
					: null;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Non-binary') {
				// return userItem?.user?.properties?.userPictureLink
				// ? userItem?.user?.properties?.userPictureLink
				// : noGenderAvatarImageURL;
				return spouseItem?.properties?.userPictureLink
					? spouseItem?.properties?.userPictureLink
					: null;
			} else {
				return spouseItem?.properties?.userPictureLink
					? spouseItem?.properties?.userPictureLink
					: null;
				// return userItem?.user?.properties?.userPictureLink
				// ? userItem?.user?.properties?.userPictureLink
				// : noGenderAvatarImageURL;
			}
	}
};

const isMainTree = (treeType: TreeTypes): boolean => treeType === TreeTypes.MainTree;
const isRootTree = (treeType: TreeTypes): boolean => treeType === TreeTypes.FatherAncestryTreeLine;
const isSubTree = (treeType: TreeTypes): boolean => treeType === TreeTypes.MotherAncestryTreeLine;

const isDescendantOrRelative = (
	member: ITreeMemberDescendant | IRelative
): member is ITreeMemberDescendant => (member as ITreeMemberDescendant)?.user && true;

const isParentLineDuplication = (
	parent: ITreeMemberDescendant,
	treeType: TreeTypes,
	parentIdentity?: string
): boolean =>
	isMainTree(treeType)
		? false
		: parent.descendant.some((child: ITreeMemberDescendant | IRelative): boolean =>
				isDescendantOrRelative(child)
					? child?.user?.identity === parentIdentity
					: child?.identity === parentIdentity
		  );

const isMotherOfRootTreeMember = (
	motherOfLoggedInMemberId: string,
	currentTreeMemberId: string
): boolean => motherOfLoggedInMemberId === currentTreeMemberId;

const shouldRenderSubTree = (
	rootMainTreeMemberSpouseId: string,
	subTreeEntryPoint: string
): boolean => rootMainTreeMemberSpouseId === subTreeEntryPoint;

const shouldRenderRootTree = (fatherTree: TreePart): boolean => {
	if (fatherTree?.length > 0 && fatherTree[0]?.user) {
		return true;
	} else {
		return false;
	}
};

const isMotherOfAuthUser = (
	authUserId: string,
	descendantLineItem: ITreeMemberDescendant
): boolean =>
	descendantLineItem?.descendant?.some(
		(child: ITreeMemberDescendant | IRelative): boolean =>
			isDescendantOrRelative(child) && child?.user?.identity === authUserId
	);

const isSpouseOfAuthUser = (descendantLineItemIdentity: string, authUserId?: string): boolean =>
	descendantLineItemIdentity === authUserId;

const shouldSwapSubTreeAndRootTree = (rootTreeMember: ITreeMemberDescendant): boolean => {
	// * Swap trees only when root user has spouse
	// * Take note of the fact that tree members swap depending on their gender
	if (isMarried(rootTreeMember)) {
		const descendantGender: string = rootTreeMember.user.properties.gender;
		const spouseGender: string = rootTreeMember.married[0].properties.gender;

		if (descendantGender === 'Male') {
			return false;
		}
		if (descendantGender === 'Female') {
			if (spouseGender === 'Female') {
				return false;
			}
			return true;
		}
		if (descendantGender === 'Non-binary') {
			if (spouseGender === 'Male') {
				return true;
			}
			if (spouseGender === 'Female') {
				return false;
			}
			if (spouseGender === 'Non-binary') {
				return false;
			}
		}
	}
	return false;
};

export {
	isRootMember,
	hasChildren,
	isMarried,
	isDescendantOrSpouse,
	isParentLineDuplication,
	renderDescendantNameDependingOnGender,
	renderDescendantAvatarDependingOnGender,
	renderSpouseNameDependingOnGender,
	renderSpouseAvatarDependingOnGender,
	isRootTree,
	isSubTree,
	isMotherOfRootTreeMember,
	shouldRenderSubTree,
	shouldRenderRootTree,
	isMotherOfAuthUser,
	isSpouseOfAuthUser,
	shouldSwapSubTreeAndRootTree,
};
