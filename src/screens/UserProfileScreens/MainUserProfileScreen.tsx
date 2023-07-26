import React, {useCallback} from 'react';

import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import {authSelector} from '~redux/slices/auth';
import {getUserAndItsPostsByIdAsync, userSelector} from '~redux/slices/user';

import {useAppDispatch} from '~hooks/redux';

import {Tabs, UserAvatarWithTitles} from '~shared';

const MainUserProfileScreen = () => {
	const dispatch = useAppDispatch();

	const authUser = useSelector(authSelector.getAuthUser);
	const user = useSelector(userSelector.getUser);

	const userData = user?.data;

	useFocusEffect(
		useCallback(() => {
			if (authUser?.data?.id) {
				dispatch(getUserAndItsPostsByIdAsync(authUser.data?.id));
			}
		}, [dispatch, authUser.data?.id])
	);

	return (
		<>
			<UserAvatarWithTitles
				username={
					(userData?.firstName || '') +
					(userData?.maidenName ? ` (${userData?.maidenName})` : '') +
					(userData?.lastName ? ` ${userData?.lastName}` : '')
				}
				image={userData?.userPictureLink}
				userId={userData?.id}
				// familyMemberTitle={'Father'}
			/>
			<Tabs />
		</>
	);
};

export default MainUserProfileScreen;
