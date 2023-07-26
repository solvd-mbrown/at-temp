import dynamicLinks from '@react-native-firebase/dynamic-links';
import {IInviteLink} from '~interfaces/IInviteLink';
import {ShareHelper} from '~services/share.helper';

const DYNAMIC_LINK_PARAMS = Object.freeze({
	domainUriPrefix: 'https://arrtreeapp.page.link',
	inviteLink: 'https://arrtreeapp.page.link/kfxD',
	packageName: 'com.arrtree', // Android package name
	bundleId: 'com.arrtree.arrtreeapp', // iOS bundle ID
});

const IOS_PUBLIC_LINK = 'https://testflight.apple.com/join/sR5KcE5G';
const ANDROID_PUBLIC_LINK =
	'https://drive.google.com/drive/folders/1QtAqtYXbsXHfKX5rRuY98ifwOPLB5l1F?usp=drive_link';

class DynamicLinksManager {
	private buildLink = async (link: string) =>
		await dynamicLinks().buildShortLink({
			link,
			domainUriPrefix: DYNAMIC_LINK_PARAMS.domainUriPrefix,
			android: {
				packageName: DYNAMIC_LINK_PARAMS.packageName, // Android package name
			},
			ios: {
				bundleId: DYNAMIC_LINK_PARAMS.bundleId, // iOS bundle ID
			},
		});

	public getParamsFromDeepLink = (deeplink = ''): Record<string, string> => {
		const queryParams = decodeURI(deeplink).split('?')[1];
		let params = {};
		if (queryParams) {
			params = queryParams.split('&').reduce((acc, param) => {
				const [key, value] = param.split('=');
				return {...acc, ...{[key]: value}};
			}, {});
		}
		return params;
	};

	public onInvitePress = ({
		firstName,
		lastName,
		invitedUserName,
		invitedUserId,
	}: IInviteLink): void => {
		const inviteLink = encodeURI(
			`${DYNAMIC_LINK_PARAMS.inviteLink}/?userId=${invitedUserId}&invitedBy=${lastName}`
		);
		const date = new Date().toLocaleDateString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});

		this.buildLink(inviteLink).then(link => {
			const options = {
				subject: 'Join on RTree',
				message: `Hi ${invitedUserName},
I wanted to invite you to join me on RTree, a family tree building app that is intended to help us share our family moments together.

To join, follow these steps:
  1a. For iOS users: Get testflight app and RTree app from ${IOS_PUBLIC_LINK}
  1b. For Android users: Get our app from ${ANDROID_PUBLIC_LINK}
  2. Install RTree app but don't open it after installation
  3. Follow this invite link: ${link}

Best regards,
${firstName} ${lastName}

${date}`,
			};

			return ShareHelper.open(options);
		});
	};
}

export const DynamicLinksHelper = new DynamicLinksManager();
