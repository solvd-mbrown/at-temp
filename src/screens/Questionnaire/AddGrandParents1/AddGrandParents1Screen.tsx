import React, {FC, useState, useCallback, useEffect, useRef} from 'react';

import {Platform} from 'react-native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {Box, Text} from 'native-base';
import {useSelector} from 'react-redux';

import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {getUserByIdAsync, updateUserByIdAsync, userSelector} from '~redux/slices/user';
import {useAppDispatch} from '~hooks/redux';
import {useKeyboard} from '~hooks';

import {CustomButton} from '~shared';

import {
	QuestionnaireStackList,
	StackQuestionnaireScreenNavigationPropsWithParams,
} from '~types/NavigationTypes';

import AddGrandParents1Form from './components/AddGrandParents1Form';
import SubmitQuestionnaireModal from '../commonComponents/SubmitQuestionnaireModal';

type AddParentsScreenProps =
	StackQuestionnaireScreenNavigationPropsWithParams<QuestionnaireStackList.AddParentsScreen>;

const AddGrandParents1Screen: FC<AddParentsScreenProps> = () => {
	const authUser = useSelector(authSelector.getAuthUser);
	const user = useSelector(userSelector.getUser);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const dispatch = useAppDispatch();

	const [detailsParent1, setDetailsParent1] = useState<string>(
		questionnaireSettings?.step5_AddParent1GrandParents?.formVariants?.parent1?.details
	);
	const [detailsParent2, setDetailsParent2] = useState<string>(
		questionnaireSettings?.step5_AddParent1GrandParents?.formVariants?.parent2?.details
	);

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isKeyboardVisible, keyboardDismiss] = useKeyboard();

	const getAuthUser = useCallback(async () => {
		if (authUser.data?.id) {
			const authUserResponse = await dispatch(getUserByIdAsync(authUser.data.id));
			if (authUserResponse) {
				console.log('authUserResponse.payload :>> ', authUserResponse.payload);
				dispatch(saveAuthUser({...authUserResponse.payload, isInitialFetchFinished: true}));
				if (authUserResponse.payload?.parents && authUserResponse.payload?.parents[0]?.identity) {
					await dispatch(getUserByIdAsync(authUserResponse.payload?.parents[0]?.identity));
				}
			}
		}
	}, [authUser.data.id, dispatch]);

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
						step5_AddParent1GrandParents: {
							...questionnaireSettings.step5_AddParent1GrandParents,
							isStep5Completed: true,
						},
						isCompleted: false,
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
				Step 5/7
			</Text>
			<Box pb={8}>
				<AddGrandParents1Form
					parent1
					detailsParent1={detailsParent1}
					setDetailsParent1={(values: string) => setDetailsParent1(values)}
					keyboardDismiss={keyboardDismiss}
				/>
				{(detailsParent1 === 'no' || user.data?.parents) && (
					<AddGrandParents1Form
						parent2
						detailsParent2={detailsParent2}
						setDetailsParent2={(values: string) => setDetailsParent2(values)}
						keyboardDismiss={keyboardDismiss}
					/>
				)}
				{((detailsParent1 === 'no' && detailsParent2 === 'no') ||
					(user?.data?.parents && detailsParent2 === 'no') ||
					user?.data?.parents?.length === 2) && (
					<CustomButton marginTop={20} onPress={onNext} title="Next" />
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

export default AddGrandParents1Screen;
