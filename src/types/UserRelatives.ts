import {IRelative} from '~interfaces/IRelative';

export type UserRelatives = {
	parents?: IRelative[];
	spouse?: IRelative[];
	children?: IRelative[];
	siblings?: IRelative[];
};
