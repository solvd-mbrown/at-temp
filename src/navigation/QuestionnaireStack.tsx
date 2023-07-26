import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import {questionnaireSettingsSelector} from '~redux/slices/auth';

import AddSpouseScreen from '~screens/Questionnaire/AddSpouseScreen/AddSpouseScreen';
import AddChildrenScreen from '~screens/Questionnaire/AddChildScreen/AddChildrenScreen';
import AddParentsScreen from '~screens/Questionnaire/AddParents/AddParentsScreen';
import AddSiblingsScreen from '~screens/Questionnaire/AddSiblingsScreen/AddSiblingsScreen';
import AddGrandParents1Screen from '~screens/Questionnaire/AddGrandParents1/AddGrandParents1Screen';
import AddGrandParents2Screen from '~screens/Questionnaire/AddGrandParents2/AddGrandParents2Screen';
import ExtraQuestions from '~screens/Questionnaire/ExtraQuestions';

import {QuestionnaireStackList, QuestionnaireStackParamList} from '~types/NavigationTypes';
import {SkipButtonOptions} from './commonNavigationComponents/SkipButtonOption';

const Stack = createStackNavigator<QuestionnaireStackParamList>();

const QuestionnaireStack = () => {
	const {colors} = useTheme();
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);

	return (
		<Stack.Navigator screenOptions={{headerTintColor: colors.text}}>
			{!questionnaireSettings?.step1_AddSpouse?.isStep1Completed && (
				<Stack.Screen
					name={QuestionnaireStackList.AddSpouseScreen}
					component={AddSpouseScreen}
					options={{
						title: 'Spouse',
						...SkipButtonOptions,
					}}
				/>
			)}
			{!questionnaireSettings?.step2_AddChildren?.isStep2Completed && (
				<Stack.Screen
					name={QuestionnaireStackList.AddChildrenScreen}
					component={AddChildrenScreen}
					options={{
						title: 'Add children',
					}}
				/>
			)}
			{!questionnaireSettings?.step3_AddParents?.isStep3Completed && (
				<Stack.Screen
					name={QuestionnaireStackList.AddParentsScreen}
					component={AddParentsScreen}
					options={{
						title: 'Add parents',
					}}
				/>
			)}
			{!questionnaireSettings?.step4_AddSiblings?.isStep4Completed &&
				(questionnaireSettings?.step3_AddParents?.isParent1Added ||
					questionnaireSettings?.step3_AddParents?.isParent2Added) && (
					<Stack.Screen
						name={QuestionnaireStackList.AddSiblingsScreen}
						component={AddSiblingsScreen}
						options={{
							title: 'Add siblings',
						}}
					/>
				)}
			{!questionnaireSettings?.step5_AddParent1GrandParents?.isStep5Completed &&
				(questionnaireSettings?.step3_AddParents?.isParent1Added ||
					questionnaireSettings?.step3_AddParents?.isParent2Added) && (
					<Stack.Screen
						name={QuestionnaireStackList.AddParent1GrandParents}
						component={AddGrandParents1Screen}
						options={{
							title: 'Add grandparents',
						}}
					/>
				)}
			{!questionnaireSettings?.step6_AddParent2GrandParents?.isStep6Completed &&
				questionnaireSettings?.step3_AddParents?.isParent1Added &&
				questionnaireSettings?.step3_AddParents?.isParent2Added && (
					<Stack.Screen
						name={QuestionnaireStackList.AddParent2GrandParents}
						component={AddGrandParents2Screen}
						options={{
							title: 'Add grandparents',
						}}
					/>
				)}
			<Stack.Screen
				name={QuestionnaireStackList.ExtraQuestions}
				component={ExtraQuestions}
				options={{
					title: 'Few details about you',
				}}
			/>
		</Stack.Navigator>
	);
};

export default QuestionnaireStack;
