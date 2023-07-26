const navigateToUserProfile = (
	userId: string,
	navigation: {navigate: (target: string, params: {userId: string}) => void}
): void =>
	navigation.navigate('UserProfileScreen', {
		userId,
	});

export default navigateToUserProfile;
