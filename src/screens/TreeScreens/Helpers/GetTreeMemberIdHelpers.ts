import {IRelative} from '~interfaces/IRelative';
import {ITreeMemberDescendant} from '~interfaces/ITreeMemberDescendant';

import {capitalizeFirstLetter} from '~utils';

import {isMarried} from './RenderTreeMembersHelpers';

// * Male always on the right side, female always on the left side
const getDescendantIDDependingOnGender = (userItem: ITreeMemberDescendant): string => {
	switch (capitalizeFirstLetter(userItem?.user?.properties?.gender)) {
		case 'Male':
			return userItem?.user?.identity;
		case 'Female':
			if (
				isMarried(userItem) &&
				capitalizeFirstLetter(userItem?.married[0]?.properties?.gender) === 'Female'
			) {
				return userItem?.user?.identity;
			} else if (isMarried(userItem)) {
				return userItem?.married[0]?.identity;
			} else {
				return userItem?.user?.identity;
			}
		default:
			if (capitalizeFirstLetter(userItem?.married[0]?.properties?.gender) === 'Male') {
				return userItem?.married[0]?.identity;
			} else {
				return userItem?.user?.identity;
			}
	}
};

const getSpouseIDDependingOnGender = (
	spouseItem: IRelative,
	userItem: ITreeMemberDescendant
): string => {
	switch (capitalizeFirstLetter(spouseItem?.properties?.gender)) {
		case 'Male':
			if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Female') {
				return userItem?.user?.identity;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Non-binary') {
				if (capitalizeFirstLetter(spouseItem?.properties?.gender) === 'Male') {
					return userItem?.user?.identity;
				}
				return spouseItem?.identity;
			} else {
				return spouseItem?.identity;
			}
		case 'Female':
			return spouseItem?.identity;
		default:
			if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Female') {
				return userItem?.user?.identity;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Non-binary') {
				return spouseItem?.identity;
			} else if (capitalizeFirstLetter(userItem?.user?.properties?.gender) === 'Male') {
				return spouseItem?.identity;
			} else {
				return userItem?.user?.identity;
			}
	}
};

export {getDescendantIDDependingOnGender, getSpouseIDDependingOnGender};
