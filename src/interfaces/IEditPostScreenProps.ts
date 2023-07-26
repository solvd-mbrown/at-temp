import {ScreenWithPostIdProp} from '~types/NavigationTypes';

export interface IEditPostScreenProps extends ScreenWithPostIdProp {
	type?: string | undefined;
	treeId?: string;
	userId?: string;
	title?: string;
}
