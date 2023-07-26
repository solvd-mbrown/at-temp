import {IUser} from './IUser';

export interface IRelative {
	identity: string;
	properties: Omit<IUser, 'id'>;
	labels: any[];
}
