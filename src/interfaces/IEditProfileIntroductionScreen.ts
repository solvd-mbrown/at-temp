import {IntroductionListItemType} from '~types/IntroductionListItem';
import {EditIntroductionDefaultProp} from '~types/NavigationTypes';

export interface IEditProfileIntroductionScreen extends EditIntroductionDefaultProp {
	type?: string;
	userId: number;
	text?: string;
	images?: [{imageLink: string}] | {[key: string]: string}[] | [] | undefined;
	video?: string;
	poster?: string;
	editable?: boolean;
	description?: string;
	elementIndex?: number;
	sectionType: string;
	parsedIntroduction?: {[key: string]: IntroductionListItemType[]} | undefined;
}
