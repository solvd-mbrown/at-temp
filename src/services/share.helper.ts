import Share from 'react-native-share';

export interface IShare {
	message: string;
	subject?: string;
	title?: string;
}

class ShareHelperManager {
	public open = async (options: IShare): Promise<void> => {
		await Share.open(options);
	};
}

export const ShareHelper = new ShareHelperManager();
