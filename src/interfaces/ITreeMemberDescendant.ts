import {IRelative} from '~interfaces/IRelative';

export interface ITreeMemberDescendant {
	user: IRelative;
	descendant: Array<ITreeMemberDescendant | IRelative>;
	married: IRelative[];
	levelCount?: number;
}
