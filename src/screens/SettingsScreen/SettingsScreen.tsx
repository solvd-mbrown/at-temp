import React, {useMemo, useCallback, FC, useState} from 'react';

import {TouchableOpacity, FlatList, Linking, Alert} from 'react-native';
import {Box, Text} from 'native-base';

import {authSelector, getUsedStorageReportByEmailAsync, signOutAsync} from '~redux/slices/auth';
import {HELP_URL} from '~utils';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

import styles from './styles';
import {useAppDispatch} from '~hooks/redux';
import {clearTree} from '~redux/slices/tree';
import {resetUserState} from '~redux/slices/user';
import {cleanPosts} from '~redux/slices/posts';
import {useSelector} from 'react-redux';
import {RenderSettingsItem} from '~screens/SettingsScreen/renderSetiingsItem';
import {useFocusEffect} from '@react-navigation/native';

type SettingsScreenProps = StackScreenPropsWithParams<RouteStackList.SettingsScreen>;

const SettingsScreen: FC<SettingsScreenProps> = ({navigation}) => {
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);
	const usedStorageSize = useSelector(authSelector.getUsedStorageSize);

	const [isDisabled, setIsDisabled] = useState(false);

	useFocusEffect(
		useCallback(() => {
			if (authUser?.data?.email) {
				dispatch(getUsedStorageReportByEmailAsync(authUser.data.email));
			}
		}, [dispatch, authUser.data?.email])
	);

	const options = useMemo(
		() => [
			{title: 'Help Center', onPress: () => onExternalLinkPress(HELP_URL)},
			{
				title: 'Feedback',
				onPress: () => navigation.navigate(RouteStackList.FeedbackScreen),
			},
			{title: `Used storage: ${usedStorageSize}`},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[usedStorageSize]
	);

	const onExternalLinkPress = useCallback(async (externalLink: string) => {
		try {
			const supported = await Linking.canOpenURL(externalLink);

			if (supported) {
				await Linking.openURL(externalLink);
			} else {
				Alert.alert(`Don't know how to open this URL: ${externalLink}`);
			}
		} catch (error) {
			console.log(error);
		}
	}, []);

	const handleSignOut = useCallback(async () => {
		setIsDisabled(true);
		dispatch(signOutAsync());
		dispatch(clearTree());
		dispatch(resetUserState());
		dispatch(cleanPosts());
	}, [dispatch]);

	return (
		<Box paddingX={6} position="relative" height="100%">
			<FlatList data={options} keyExtractor={item => item.title} renderItem={RenderSettingsItem} />
			<TouchableOpacity style={styles.buttonWrapper} onPress={handleSignOut} disabled={isDisabled}>
				<Text style={[styles.buttonText, isDisabled && styles.disabledButtonText]}>Log Out</Text>
			</TouchableOpacity>
		</Box>
	);
};

export default SettingsScreen;
