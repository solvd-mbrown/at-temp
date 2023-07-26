import {ScreenWithPostIdProp} from '~types/NavigationTypes';

export interface ICommentsScreenProps extends ScreenWithPostIdProp {
	comments: number[] | [];
	postAuthorId: number;
}
