import React, {FC, useState, useCallback, useEffect, useRef} from 'react';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {Box, Text} from 'native-base';
import {useSelector} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';

import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {getUserByIdAsync, updateUserByIdAsync} from '~redux/slices/user';

import {useAppDispatch} from '~hooks/redux';
import {useKeyboard} from '~hooks';

import {CustomButton} from '~shared';

import {
	QuestionnaireStackList,
	StackQuestionnaireScreenNavigationPropsWithParams,
} from '~types/NavigationTypes';

import AddChildrenForm from './components/AddChildrenForm';
import SubmitQuestionnaireModal from '../commonComponents/SubmitQuestionnaireModal';
import {Platform} from 'react-native';

type AddChildrenScreenProps =
	StackQuestionnaireScreenNavigationPropsWithParams<QuestionnaireStackList.AddChildrenScreen>;

const AddChildrenScreen: FC<AddChildrenScreenProps> = () => {
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	const [newChildDetails, setNewChildDetails] = useState<string | undefined>('');
	const [isKeyboardVisible, keyboardDismiss] = useKeyboard();

	const getAuthUser = useCallback(async () => {
		if (authUser.data?.id) {
			const authUserResponse = await dispatch(getUserByIdAsync(authUser.data.id));
			if (authUserResponse) {
				dispatch(saveAuthUser({...authUserResponse.payload, isInitialFetchFinished: true}));
			}
		}
	}, [authUser.data?.id, dispatch]);

	useEffect(() => {
		getAuthUser();
	}, [getAuthUser]);

	const handleModalSubmit = async (): Promise<void> => {
		const updateUserResponse = await dispatch(
			updateUserByIdAsync({
				userId: authUser?.data?.id,
				userData: {
					setting: {
						...questionnaireSettings,
						step2_AddChildren: {
							...questionnaireSettings.step2_AddChildren,
							isStep2Completed: true,
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

	return loading ? (
		<Spinner visible={loading} color="#E8AD63" />
	) : (
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
				Step 2/7
			</Text>
			<Box pb={8}>
				{authUser?.data?.kids?.length > 0 &&
					// eslint-disable-next-line no-unsafe-optional-chaining
					[...authUser?.data?.kids]
						?.sort((a: any, b: any) => a?.properties?.createDate - b?.properties?.createDate)
						?.map(
							(
								kid: {
									identity: string;
									properties: {
										firstName: string;
										lastName: string;
										birthdate: string;
										dateOfDeath?: string;
										gender: string;
										userPictureLink?: string;
									};
								},
								index: number
							) => (
								<AddChildrenForm
									childNumber={index + 1}
									key={kid?.identity}
									firstName={kid?.properties?.firstName}
									lastName={kid?.properties?.lastName}
									birthdate={kid?.properties?.birthdate}
									dateOfDeath={kid?.properties?.dateOfDeath}
									gender={kid?.properties?.gender}
									userPictureLink={kid?.properties?.userPictureLink}
									keyboardDismiss={keyboardDismiss}
									setLoading={(load: boolean) => setLoading(load)}
								/>
							)
						)}
				{(!authUser?.data?.kids || authUser?.data?.kids?.length > 0) && (
					<AddChildrenForm
						newChild
						setNewChildDetails={(details: string) => setNewChildDetails(details)}
						childNumber={authUser?.data?.kids?.length > 0 ? authUser?.data?.kids?.length + 1 : 1}
						setLoading={(load: boolean) => setLoading(load)}
						keyboardDismiss={keyboardDismiss}
					/>
				)}
				{(newChildDetails === 'no' || (authUser?.data?.kids && newChildDetails === 'no')) && (
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

export default AddChildrenScreen;
