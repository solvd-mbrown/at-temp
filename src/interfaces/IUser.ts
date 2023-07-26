import {QuestionnaireSettings} from '~types/QuestionnaireSettings';

import {IRelative} from './IRelative';

export interface IUser {
	id: string;
	email: string;
	gender: string;
	birthdate?: string;
	firstName: string;
	lastName?: string;
	maidenName?: string;
	userPictureLink?: string;
	userPictureKey?: string;
	introduction?: string;
	dateOfDeath?: string;
	isDeceased?: boolean;
	isActivated: boolean;
	treeOwner?: boolean;
	hometown?: string;
	homeCountry?: string;
	phone?: string;
	address?: string;
	spouseTreeId?: string;
	myTreeIdByParent1: string;
	myTreeIdByParent2?: string;
	storageFolderId?: string;
	spouse?: IRelative[];
	kids?: IRelative[];
	parents?: IRelative[];
	siblings?: IRelative[];
	socialNetworks?: string;
	setting: string | QuestionnaireSettings;
	// Below properties are not using
	updateDate: number;
	createDate: number;
}
