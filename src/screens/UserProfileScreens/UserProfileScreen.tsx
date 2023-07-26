import React, {FC, useCallback} from 'react';

import {useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';

import {getUserAndItsPostsByIdAsync, userSelector} from '~redux/slices/user';
import {authSelector} from '~redux/slices/auth';

import {useAppDispatch} from '~hooks/redux';

import {Tabs, UserAvatarWithTitles} from '~shared';

import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

type UserProfileScreenProps = StackScreenPropsWithParams<RouteStackList.UserProfileScreen>;

const UserProfileScreen: FC<UserProfileScreenProps> = ({route}) => {
	const dispatch = useAppDispatch();

	const authUser = useSelector(authSelector.getAuthUser);
	const user = useSelector(userSelector.getUser);

	const userData = user?.data;

	useFocusEffect(
		useCallback(() => {
			dispatch(getUserAndItsPostsByIdAsync(route?.params?.userId || authUser.data?.id));
		}, [dispatch, route?.params?.userId, authUser.data?.id])
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
				// generation={'-1G'}
			/>
			<Tabs />
		</>
	);
};

export default UserProfileScreen;
