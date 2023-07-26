import React, {FC, useState, useCallback, useEffect, useRef} from 'react';

import {Platform} from 'react-native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {Box, Text} from 'native-base';
import {useSelector} from 'react-redux';

import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {getUserByIdAsync, updateUserByIdAsync, userSelector} from '~redux/slices/user';
import {useKeyboard} from '~hooks';
import {useAppDispatch} from '~hooks/redux';

import {CustomButton} from '~shared';

import {
	QuestionnaireStackList,
	StackQuestionnaireScreenNavigationPropsWithParams,
} from '~types/NavigationTypes';

import AddGrandParents2Form from './components/AddGrandParents2Form';
import SubmitQuestionnaireModal from '../commonComponents/SubmitQuestionnaireModal';

type AddParentsScreenProps =
	StackQuestionnaireScreenNavigationPropsWithParams<QuestionnaireStackList.AddParentsScreen>;

const AddGrandParents2Screen: FC<AddParentsScreenProps> = () => {
	const authUser = useSelector(authSelector.getAuthUser);
	const user = useSelector(userSelector.getUser);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const dispatch = useAppDispatch();

	const [detailsParent1, setDetailsParent1] = useState<string>(
		questionnaireSettings?.step6_AddParent2GrandParents?.formVariants?.parent1?.details
	);
	const [detailsParent2, setDetailsParent2] = useState<string>(
		questionnaireSettings?.step6_AddParent2GrandParents?.formVariants?.parent2?.details
	);

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isKeyboardVisible, keyboardDismiss] = useKeyboard();

	const getAuthUser = useCallback(async () => {
		if (authUser.data?.id) {
			const authUserResponse = await dispatch(getUserByIdAsync(authUser.data.id));
			if (authUserResponse) {
				console.log('authUserResponse.payload :>> ', authUserResponse.payload);
				dispatch(saveAuthUser({...authUserResponse.payload, isInitialFetchFinished: true}));
				if (authUserResponse.payload?.parents && authUserResponse.payload?.parents[1]?.identity) {
					await dispatch(getUserByIdAsync(authUserResponse.payload?.parents[1]?.identity));
				}
			}
		}
	}, [authUser.data?.id, dispatch]);

	useEffect(() => {
		getAuthUser();
	}, [getAuthUser]);

	const handleModalSubmit = async (): Promise<void> => {
		const updateUserResponse = await dispatch(
			updateUserByIdAsync({
				userId: authUser.data?.id,
				userData: {
					setting: {
						...questionnaireSettings,
						step6_AddParent2GrandParents: {
							...questionnaireSettings.step6_AddParent2GrandParents,
							isStep6Completed: true,
						},
					},
				},
			})
		);
		if (updateUserResponse) {
			dispatch(saveAuthUser(updateUserResponse.payload));
			setIsModalVisible(false);
		}
	};

	const onNext = (): void => {
		if (questionnaireSettings.doNotShowQuestionnaireModal) {
			handleModalSubmit();
		} else {
			setIsModalVisible(true);
		}
	};
	// TODO types for useRef
	const scrollViewRef = useRef();

	return (
		<KeyboardAwareScrollView
			enableOnAndroid
			extraHeight={0}
			// @ts-ignore
			ref={scrollViewRef}
			onContentSizeChange={_ => {
				if (Platform.OS === 'ios' || (Platform.OS === 'android' && !isKeyboardVisible)) {
					// @ts-ignore
					scrollViewRef?.current?.scrollToEnd({animated: true});
				}
			}}
		>
			<Text alignSelf="center" marginY={4}>
				Step 6/7
			</Text>
			<Box pb={8}>
				<AddGrandParents2Form
					parent1
					detailsParent1={detailsParent1}
					setDetailsParent1={(values: string) => setDetailsParent1(values)}
					keyboardDismiss={keyboardDismiss}
				/>
				{(detailsParent1 === 'no' || user.data?.parents) && (
					<AddGrandParents2Form
						parent2
						detailsParent2={detailsParent2}
						setDetailsParent2={(values: string) => setDetailsParent2(values)}
						keyboardDismiss={keyboardDismiss}
					/>
				)}
				{((detailsParent1 === 'no' && detailsParent2 === 'no') ||
					(user?.data?.parents && detailsParent2 === 'no') ||
					user?.data?.parents?.length === 2) && (
					<CustomButton marginTop={10} onPress={onNext} title="Next" />
				)}
			</Box>
			<SubmitQuestionnaireModal
				isModalVisible={isModalVisible}
				setIsModalVisible={setIsModalVisible}
				onSubmit={handleModalSubmit}
			/>
		</KeyboardAwareScrollView>
	);
};

export default AddGrandParents2Screen;
