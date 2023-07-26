import {ProfileScreenDefaultProp} from '~types/NavigationTypes';

export interface IEditCommentScreenProps extends ProfileScreenDefaultProp {
	type: string;
	commentId: string;
}
