/* eslint-disable react/no-unstable-nested-components */
import React, {useState} from 'react';

import {Platform, TouchableOpacity} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {scale} from 'react-native-utils-scale';
import {Box, HStack, Icon, Text} from 'native-base';
import {useTheme} from '@react-navigation/native';
import {useOrientationChange} from 'react-native-orientation-locker';
import {Octicons} from '@expo/vector-icons';

import {useSelector} from 'react-redux';

import {getTreeInPartsByIdAsync} from '~redux/slices/tree';
import {authSelector} from '~redux/slices/auth';

import TreeScreen from '~screens/TreeScreens/TreeScreen';
import MainUserProfileScreen from '~screens/UserProfileScreens/MainUserProfileScreen';
import PostsScreen from '~screens/PostsScreen/PostsScreen';
import EmptyScreen from '~screens/EmptyScreen';

import {useAppDispatch} from '~hooks/redux';

import {TabIcon} from '~shared';
import {FeedbackIcon} from '~shared/Icons';

import {ScreenWithoutProps} from '~types/ScreenWithoutProps';
import {RouteStackList} from '~types/NavigationTypes';

import {styles} from './styles';
import {FeedbackIconOption} from './commonNavigationComponents/FeedbackIconOption';

export type RootTabParamList = {
	tree: ScreenWithoutProps;
	posts: ScreenWithoutProps;
	profile: ScreenWithoutProps;
	notifications: ScreenWithoutProps;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const TabNavigator = () => {
	const {colors} = useTheme();
	const [showHeader, setShowHeader] = useState(false);
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);

	useOrientationChange(
		orientation =>
			!orientation.includes('UNKNOWN') && setShowHeader(!orientation.includes('LANDSCAPE'))
	);

	const fetchMyTree = () => {
		dispatch(
			getTreeInPartsByIdAsync({
				treeId: authUser.data?.myTreeIdByParent1,
				userId: authUser.data?.id,
			})
		);
	};

	return (
		<Tab.Navigator
			screenOptions={{
				tabBarStyle: [
					styles.tabBarStyle,
					showHeader ? styles.displayFlexStyle : styles.displayNoneStyle,
				],
				tabBarLabelStyle: styles.tabBarLabelStyle,
				tabBarItemStyle: styles.tabBarItemStyle,
				tabBarAllowFontScaling: true,
				tabBarActiveTintColor: colors.primary,
			}}
		>
			<Tab.Screen
				name="tree"
				component={TreeScreen}
				listeners={{
					tabPress: () => fetchMyTree(),
				}}
				options={({navigation}) => ({
					headerShown: showHeader,
					title: 'My tree',
					headerTitle: '',
					headerLeft: () => (
						<Text fontFamily="Roboto" fontSize={20} fontWeight={600} color={colors.text}>
							My tree
						</Text>
					),
					headerLeftContainerStyle: {
						paddingLeft: scale(16),
					},
					tabBarIcon: ({focused}) => <TabIcon focused={focused} name="tree" />,
					tabBarAllowFontScaling: true,
					...FeedbackIconOption(navigation),
				})}
			/>
			<Tab.Screen
				name="posts"
				component={PostsScreen}
				options={({navigation}) => ({
					title: 'Moments',
					headerTitle: '',
					headerLeft: () => (
						<Text fontFamily="Roboto" fontSize={20} fontWeight={600} color={colors.text}>
							Moments
						</Text>
					),
					headerLeftContainerStyle: {
						paddingLeft: scale(16),
					},
					tabBarIcon: ({focused}) => <TabIcon focused={focused} name="posts" />,
					...FeedbackIconOption(navigation),
				})}
			/>
			<Tab.Screen
				name="profile"
				component={MainUserProfileScreen}
				options={({navigation}) => ({
					title: 'Profile',
					tabBarIcon: ({focused}) => <TabIcon focused={focused} name="profile" />,
					headerTitle: '',
					headerLeft: () => (
						<Text fontFamily="Roboto" fontSize={20} fontWeight={500} color={colors.text}>
							My profile
						</Text>
					),
					headerRight: () => (
						<HStack>
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => navigation.navigate(RouteStackList.FeedbackScreen)}
							>
								<Box
									width={10}
									height={10}
									paddingTop={Platform.OS === 'ios' ? 0 : 0.5}
									justifyContent="center"
									alignItems="center"
								>
									<FeedbackIcon />
								</Box>
							</TouchableOpacity>
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() => navigation.navigate(RouteStackList.SettingsScreen)}
							>
								<Box width={10} height={10} justifyContent="center" alignItems="center">
									<Text paddingTop={Platform.OS === 'ios' ? 0 : 0.5}>
										<Icon as={Octicons} name="gear" size={6} color={colors.text} marginRight={1} />
									</Text>
								</Box>
							</TouchableOpacity>
						</HStack>
					),
					headerLeftContainerStyle: {
						paddingLeft: scale(16),
					},
					headerRightContainerStyle: {
						paddingRight: scale(16),
					},
				})}
			/>
			<Tab.Screen
				name="notifications"
				component={EmptyScreen}
				options={({navigation}) => ({
					title: 'Notifications',
					headerTitle: '',
					headerLeft: () => (
						<Text fontFamily="Roboto" fontSize={20} fontWeight={600} color={colors.text}>
							Notifications
						</Text>
					),
					headerLeftContainerStyle: {
						paddingLeft: scale(16),
					},
					tabBarIcon: ({focused}) => <TabIcon focused={focused} name="notifications" />,
					...FeedbackIconOption(navigation),
				})}
			/>
		</Tab.Navigator>
	);
};

export default TabNavigator;
