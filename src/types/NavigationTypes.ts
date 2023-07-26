import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';

import {IEditCommentScreenProps} from '~interfaces/IEditCommentScreenProps';
import {IEditIntroductionListScreen} from '~interfaces/IEditIntroductionListScreen';
import {IEditPostScreenProps} from '~interfaces/IEditPostScreenProps';
import {IEditProfileIntroductionScreen} from '~interfaces/IEditProfileIntroductionScreen';
import {ICommentsScreenProps} from '~interfaces/ICommentsScreenProps';
import {IEditProfileScreenProps} from '~interfaces/IEditProfileProps';

import {MediaParamsType} from './MediaParams';
import {ScreenWithoutProps} from './ScreenWithoutProps';
import {CongratulationModalScreenProps} from './CongratulationModalScreenProps';

export enum RouteStackList {
	CommentsScreen = 'CommentsScreen',
	PostsScreen = 'PostsScreen',
	EditCommentScreen = 'EditCommentScreen',
	LoginScreen = 'LoginScreen',
	WelcomeScreen = 'WelcomeScreen',
	TabsDefault = 'TabsDefault',
	UserProfileScreen = 'UserProfileScreen',
	UserIntroductionScreen = 'UserIntroductionScreen',
	EditProfileScreen = 'EditProfileScreen',
	EditProfileBasicInfoScreen = 'EditProfileBasicInfoScreen',
	SettingsScreen = 'SettingsScreen',
	EditProfileContactsScreen = 'EditProfileContactsScreen',
	FeedbackScreen = 'FeedbackScreen',
	EditProfileSocialScreen = 'EditProfileSocialScreen',
	EditIntroductionListScreen = 'EditIntroductionListScreen',
	TermsAndConditions = 'TermsAndConditions',
	EditProfileIntroductionScreen = 'EditProfileIntroductionScreen',
	EditPostScreen = 'EditPostScreen',
	TipsScreen = 'TipsScreen',
	CongratulationModalScreen = 'CongratulationModalScreen',
	UserIsExistModalScreen = 'UserIsExistModalScreen',
	QuestionnaireStack = 'QuestionnaireStack',
}

export enum QuestionnaireStackList {
	AddSpouseScreen = 'AddSpouseScreen',
	AddChildrenScreen = 'AddChildrenScreen',
	AddParentsScreen = 'AddParentsScreen',
	AddSiblingsScreen = 'AddSiblingsScreen',
	AddParent1GrandParents = 'AddParent1GrandParents',
	AddParent2GrandParents = 'AddParent2GrandParents',
	ExtraQuestions = 'ExtraQuestions',
}

export type QuestionnaireStackParamList = {
	[QuestionnaireStackList.AddSpouseScreen]: ScreenWithoutProps;
	[QuestionnaireStackList.AddChildrenScreen]: ScreenWithoutProps;
	[QuestionnaireStackList.AddParentsScreen]: ScreenWithoutProps;
	[QuestionnaireStackList.AddSiblingsScreen]: ScreenWithoutProps;
	[QuestionnaireStackList.AddParent1GrandParents]: ScreenWithoutProps;
	[QuestionnaireStackList.AddParent2GrandParents]: ScreenWithoutProps;
	[QuestionnaireStackList.ExtraQuestions]: ScreenWithoutProps;
};

export type ProfileScreenDefaultProp = {userId: string};

export type EditIntroductionDefaultProp = {
	mediaParameters?: MediaParamsType;
};

export type ScreenWithPostIdProp = {
	postId?: string;
};

export type RootStackParamList = {
	[RouteStackList.CommentsScreen]: ICommentsScreenProps;
	[RouteStackList.PostsScreen]: ScreenWithoutProps;
	[RouteStackList.EditCommentScreen]: IEditCommentScreenProps;
	[RouteStackList.LoginScreen]: ScreenWithoutProps;
	[RouteStackList.WelcomeScreen]: ScreenWithoutProps;
	[RouteStackList.TabsDefault]: ScreenWithoutProps;
	[RouteStackList.UserProfileScreen]: ProfileScreenDefaultProp;
	[RouteStackList.UserIntroductionScreen]: ScreenWithoutProps;
	[RouteStackList.EditProfileScreen]: ProfileScreenDefaultProp;
	[RouteStackList.EditProfileBasicInfoScreen]: IEditProfileScreenProps;
	[RouteStackList.SettingsScreen]: ScreenWithoutProps;
	[RouteStackList.EditProfileContactsScreen]: IEditProfileScreenProps;
	[RouteStackList.FeedbackScreen]: ScreenWithoutProps;
	[RouteStackList.EditProfileSocialScreen]: IEditProfileScreenProps;
	[RouteStackList.EditIntroductionListScreen]: IEditIntroductionListScreen;
	[RouteStackList.TermsAndConditions]: ScreenWithoutProps;
	[RouteStackList.EditProfileIntroductionScreen]: IEditProfileIntroductionScreen;
	[RouteStackList.EditPostScreen]: IEditPostScreenProps;
	[RouteStackList.TipsScreen]: ScreenWithoutProps;
	[RouteStackList.CongratulationModalScreen]: CongratulationModalScreenProps;
	[RouteStackList.UserIsExistModalScreen]: ScreenWithoutProps;
	[RouteStackList.QuestionnaireStack]: ScreenWithoutProps;
};

export type StackScreenPropsWithParams<
	RouteName extends keyof RootStackParamList,
	NavigatorID extends string | undefined = undefined
> = StackScreenProps<RootStackParamList, RouteName, NavigatorID>;

export type StackNavigationPropsWithParams<
	RouteName extends keyof RootStackParamList,
	NavigatorID extends string | undefined = undefined
> = StackNavigationProp<RootStackParamList, RouteName, NavigatorID>;

export type StackQuestionnaireScreenNavigationPropsWithParams<
	RouteName extends keyof QuestionnaireStackParamList,
	NavigatorID extends string | undefined = undefined
> = StackScreenProps<QuestionnaireStackParamList, RouteName, NavigatorID>;
