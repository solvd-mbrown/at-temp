import React, {useEffect, useCallback} from 'react';

import {NavigationContainer, DefaultTheme, useTheme} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import dynamicLinks, {FirebaseDynamicLinksTypes} from '@react-native-firebase/dynamic-links';

import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {userSelector} from '~redux/slices/user';
import {postsSelector} from '~redux/slices/posts';
import {commentsSelector} from '~redux/slices/comments';
import {fileUploadsSelector} from '~redux/slices/fileUploads';
import {createTreeByIdAsync} from '~redux/slices/tree';
import {cleanInviteLink, setInviteLink} from '~redux/slices/deepLinks';

import LoginScreen from '~screens/LoginScreen/LoginScreen';
import UserProfileScreen from '~screens/UserProfileScreens/UserProfileScreen';
import UserIntroductionScreen from '~screens/UserProfileScreens/UserIntroductionScreen';
import PostsScreen from '~screens/PostsScreen/PostsScreen';
import CommentsScreen from '~screens/CommentsScreen/CommentsScreen';
import EditProfileScreen from '~screens/EditProfileScreens/EditProfileScreen';
import EditProfileBasicInfoScreen from '~screens/EditProfileScreens/EditProfileBasicInfoScreen';
import EditProfileContactsScreen from '~screens/EditProfileScreens/EditProfileContactsScreen';
import EditIntroductionListScreen from '~screens/EditProfileScreens/EditIntroductionListScreen';
import EditProfileSocialScreen from '~screens/EditProfileScreens/EditProfileSocialScreen';
import EditProfileIntroductionScreen from '~screens/EditProfileScreens/EditProfileIntroductionScreen';
import EditPostScreen from '~screens/PostsScreen/EditPostScreen';
import EditCommentScreen from '~screens/CommentsScreen/EditCommentScreen';
import SettingsScreen from '~screens/SettingsScreen/SettingsScreen';
import FeedbackScreen from '~screens/FeedBackScreen/FeedbackScreen';
import TermsAndConditions from '~screens/TermsAndConditions/TermsAndConditions';
import TipsScreen from '~screens/TipsScreen/TipsScreen';
import WelcomeScreen from '~screens/WelcomeScreen/WelcomeScreen';

import {useOverlaySpinner} from '~hooks';
import {useAppDispatch} from '~hooks/redux';

import {UploadSpinner} from '~shared';

import TabNavigator from './TabNavigator';

import {RootStackParamList, RouteStackList} from '~types/NavigationTypes';
import {InitializeTreeData} from '~redux/@types';

import QuestionnaireStack from './QuestionnaireStack';
import {FeedbackIconOption} from './commonNavigationComponents/FeedbackIconOption';
import {DynamicLinksHelper} from '~services/dynamicLinks.helper';
import CongratulationModalScreen from '~screens/WelcomeScreen/CongratulationModalScreen';
import UserIsExistModalScreen from '~screens/WelcomeScreen/userIsExistModalScreen';

const Stack = createStackNavigator<RootStackParamList>();

const MyTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: '#E8AD63',
		background: 'white',
		text: '#252A31',
	},
};

const AppNavigator = () => {
	const {colors} = useTheme();
	const dispatch = useAppDispatch();
	const authLoading = useSelector(authSelector.getAuthLoading);
	const isAuthorized = useSelector(authSelector.getIsAuthorized);
	const authUser = useSelector(authSelector.getAuthUser);
	const usedStorageLoading = useSelector(authSelector.getUsedStorageLoading);
	const userLoading = useSelector(userSelector.getUserLoading);
	const postsLoading = useSelector(postsSelector.getPostsLoading);
	const commentsLoading = useSelector(commentsSelector.getCommentsLoading);
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);

	const isOverlaySpinnerVisible = useOverlaySpinner(
		authLoading || userLoading || postsLoading || commentsLoading || usedStorageLoading
	);

	const initializeTree = useCallback(
		async (newTreeData: InitializeTreeData) => {
			try {
				const res: any = await dispatch(createTreeByIdAsync(newTreeData));
				if (res?.payload?.id) {
					dispatch(saveAuthUser({myTreeIdByParent1: res.payload.id}));
				}
			} catch (error) {
				console.log('InitializeTree error :>> ', error);
			}
		},
		[dispatch]
	);

	useEffect(() => {
		if (authUser?.data?.id && !authUser?.data?.myTreeIdByParent1) {
			const newTreeData = {
				userId: authUser.data.id,
				name: `NewTree${authUser.data.id}`,
			};
			initializeTree(newTreeData);
		}
	}, [dispatch, authUser.data, initializeTree]);

	const handleDynamicLink = (link: FirebaseDynamicLinksTypes.DynamicLink | null): void => {
		dispatch(cleanInviteLink());
		const {userId = '', invitedBy = ''} = DynamicLinksHelper.getParamsFromDeepLink(link?.url);
		const inviteLinksParams = {
			userId,
			invitedBy,
		};
		dispatch(setInviteLink(inviteLinksParams));
	};

	useEffect(() => {
		dynamicLinks().getInitialLink().then(handleDynamicLink);
		const unsubscribe = dynamicLinks().onLink(handleDynamicLink);
		return () => {
			unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<UploadSpinner total={fileUploads.total} loaded={fileUploads.loaded} />
			<Spinner visible={isOverlaySpinnerVisible} color="#E8AD63" />

			<NavigationContainer theme={MyTheme}>
				<Stack.Navigator
					initialRouteName={RouteStackList.LoginScreen}
					screenOptions={{headerTintColor: colors.text}}
				>
					{isAuthorized ? (
						<>
							{authUser?.data?.id &&
							!questionnaireSettings?.isSkipped &&
							!questionnaireSettings?.isCompleted ? (
								<>
									{!questionnaireSettings?.isUserUpdatedOnWelcomeScreen ? (
										<>
											<Stack.Screen
												name={RouteStackList.WelcomeScreen}
												component={WelcomeScreen}
												options={{
													headerShown: false,
												}}
											/>
											<Stack.Screen
												name={RouteStackList.CongratulationModalScreen}
												component={CongratulationModalScreen}
												options={{
													headerShown: false,
													presentation: 'transparentModal',
												}}
											/>
											<Stack.Screen
												name={RouteStackList.UserIsExistModalScreen}
												component={UserIsExistModalScreen}
												options={{
													headerShown: false,
													presentation: 'transparentModal',
												}}
											/>
										</>
									) : (
										<Stack.Screen
											name={RouteStackList.QuestionnaireStack}
											component={QuestionnaireStack}
											options={{
												headerShown: false,
											}}
										/>
									)}
								</>
							) : (
								<>
									<Stack.Screen
										name={RouteStackList.TabsDefault}
										component={TabNavigator}
										options={({navigation}) => ({
											headerShown: false,
											...FeedbackIconOption(navigation),
										})}
									/>
									<Stack.Screen
										name={RouteStackList.UserProfileScreen}
										component={UserProfileScreen}
										options={({navigation}) => ({
											title: 'User Profile',
											orientation: 'portrait',
											headerBackTitle: 'Back',
											...FeedbackIconOption(navigation),
										})}
									/>
									<Stack.Screen
										name={RouteStackList.UserIntroductionScreen}
										component={UserIntroductionScreen}
										options={({navigation}) => ({
											title: 'About me',
											orientation: 'portrait',
											headerBackTitle: 'Back',
											...FeedbackIconOption(navigation),
										})}
									/>
									<Stack.Group
										// Edit profile screens group
										screenOptions={{
											headerBackTitle: 'Back',
										}}
									>
										<Stack.Screen
											name={RouteStackList.EditProfileScreen}
											component={EditProfileScreen}
											options={({navigation}) => ({
												title: 'Edit profile',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditProfileBasicInfoScreen}
											component={EditProfileBasicInfoScreen}
											options={({navigation}) => ({
												title: 'Basic Info',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditProfileContactsScreen}
											component={EditProfileContactsScreen}
											options={({navigation}) => ({
												title: 'Contacts',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditIntroductionListScreen}
											component={EditIntroductionListScreen}
											options={({navigation}) => ({
												title: 'Introduction',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditProfileIntroductionScreen}
											component={EditProfileIntroductionScreen}
											options={({navigation}) => ({
												title: 'Introduction',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditProfileSocialScreen}
											component={EditProfileSocialScreen}
											options={({navigation}) => ({
												title: 'Social Networks',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditPostScreen}
											component={EditPostScreen}
											options={({navigation, route}) => ({
												title: route.params?.title ? route.params?.title : 'New Moment',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.PostsScreen}
											component={PostsScreen}
											options={({navigation}) => ({
												title: 'Posts',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.CommentsScreen}
											component={CommentsScreen}
											options={({navigation}) => ({
												title: 'Comments',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.EditCommentScreen}
											component={EditCommentScreen}
											options={({navigation}) => ({
												title: 'Edit Comment',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.SettingsScreen}
											component={SettingsScreen}
											options={({navigation}) => ({
												title: 'Settings',
												headerBackTitle: 'Back',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.FeedbackScreen}
											component={FeedbackScreen}
											options={{
												title: 'Feedback',
												headerBackTitle: 'Back',
											}}
										/>
										<Stack.Screen
											name={RouteStackList.TermsAndConditions}
											component={TermsAndConditions}
											options={({navigation}) => ({
												title: 'Terms and Conditions',
												headerBackTitle: 'Back',
												...FeedbackIconOption(navigation),
											})}
										/>
										<Stack.Screen
											name={RouteStackList.TipsScreen}
											component={TipsScreen}
											options={{
												headerShown: false,
												presentation: 'transparentModal',
											}}
										/>
									</Stack.Group>
								</>
							)}
						</>
					) : (
						<>
							<Stack.Screen
								name={RouteStackList.LoginScreen}
								component={LoginScreen}
								options={{headerShown: false}}
							/>
						</>
					)}
				</Stack.Navigator>
			</NavigationContainer>
		</>
	);
};

export default AppNavigator;
