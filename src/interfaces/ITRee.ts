import {TreePart} from '~types/TreePart';

export interface ITree {
	id: string;
	name: string;
	uuid: string;
	createDate: number;
	rootPartTree: TreePart;
	subTree: TreePart | null;
	bottomPartTree: TreePart;
}
