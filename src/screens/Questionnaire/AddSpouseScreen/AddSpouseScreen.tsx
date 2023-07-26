import React, {FC, useCallback, useEffect, useState, useRef} from 'react';

import {Alert, TouchableOpacity, Platform} from 'react-native';
import {Text, Box, Radio} from 'native-base';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import {useActionSheet} from '@expo/react-native-action-sheet';
import ImagePickerCropper, {Options} from 'react-native-image-crop-picker';
import {useSelector} from 'react-redux';
import PhotoEditor from 'react-native-photo-editor';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import {useTheme} from '@react-navigation/native';

import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {createRelativeAsync, getUserByIdAsync, updateUserByIdAsync} from '~redux/slices/user';
import {
	createFileUploadsAsync,
	fileUploadsSelector,
	restoreSingleFileUpload,
} from '~redux/slices/fileUploads';

import {useAppDispatch} from '~hooks/redux';
import {useKeyboard} from '~hooks';

import {noGenderAvatarImage} from '~images';
import {InputType, QuestionnaireCases, spouseDetailsSchema} from '~utils';
import {CustomTextInput, CustomButton} from '~shared';
import {CalendarIcon} from '~shared/Icons';

import {InitialValues} from '~types/InitialValues';
import {ImagePickerResponseType} from '~types/ImagePickerResponseType';
import {PrepareUploadingMediaType} from '~types/PrepareUploadingMediaType';
import {
	QuestionnaireStackList,
	StackQuestionnaireScreenNavigationPropsWithParams,
} from '~types/NavigationTypes';
import {IImagePickerResult} from '~interfaces/IImagePickerResult';

import styles from './styles';
import SubmitQuestionnaireModal from '../commonComponents/SubmitQuestionnaireModal';
import QuestionnaireInfoModal from './components/QuestionnaireInfoModal';

type AddSpouseScreenProps =
	StackQuestionnaireScreenNavigationPropsWithParams<QuestionnaireStackList.AddSpouseScreen>;

const FORM_VARIANTS = {
	married: ['yes', 'no', 'divorced', 'widowed'],
	details: ['yes', 'no'],
	deceased: ['yes', 'no'],
};

const AddSpouseScreen: FC<AddSpouseScreenProps> = () => {
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const {colors} = useTheme();

	const [married, setMarried] = useState<string>(
		questionnaireSettings?.step1_AddSpouse?.formVariants?.married
	);
	const [deceased, setDeceased] = useState<string>(
		questionnaireSettings?.step1_AddSpouse?.formVariants?.deceased
	);

	const [isInfoModalVisible, setIsInfoModalVisible] = useState<boolean>(true);
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const {showActionSheetWithOptions} = useActionSheet();
	const [isKeyboardVisible, keyboardDismiss] = useKeyboard();

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType>(null);
	const [imageFormat, setImageFormat] = useState<string>('');
	const AbortUploadingController = new AbortController();

	const InitialValues: InitialValues = {
		firstName: authUser?.data?.spouse ? authUser?.data?.spouse[0]?.properties.firstName : '',
		lastName: authUser?.data?.spouse ? authUser?.data?.spouse[0]?.properties.lastName : '',
		birthdate: authUser?.data?.spouse ? authUser?.data?.spouse[0]?.properties.birthdate : '',
		gender: authUser?.data?.spouse ? authUser?.data?.spouse[0]?.properties.gender : '',
		details: questionnaireSettings?.step1_AddSpouse?.formVariants?.details
			? questionnaireSettings?.step1_AddSpouse?.formVariants?.details
			: '',
		dateOfDeath: authUser?.data?.spouse ? authUser?.data?.spouse[0]?.properties?.dateOfDeath : '',
		anniversaryDate: authUser?.data?.spouse
			? authUser?.data?.spouse[0]?.properties?.anniversaryDate
			: '',
	};

	const isDisabled = questionnaireSettings?.step1_AddSpouse?.formVariants
		? !!questionnaireSettings?.step1_AddSpouse?.formVariants?.married
		: false;

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

	const prepareUploadingMedia = async ({result, modifiedImage}: PrepareUploadingMediaType) => {
		// 100mb in kilobytes
		const limitedFileSize = 1e8;
		const modifiedPhotoSize = await FileSystem.getInfoAsync(modifiedImage);

		if ((modifiedPhotoSize.size as number) > limitedFileSize) {
			Alert.alert('File size exceeds 100 Mb.', 'Please choose another file.', [
				{
					text: 'Ok',
					onPress: () => {
						return;
					},
				},
			]);
			return;
		}

		setImageFormat(result.mime);

		setImagePickerResponse({
			path: modifiedImage,
			type: result.mime,
			fileName: modifiedImage,
		});
	};

	const handleShowImagePicker = useCallback(async (option: string) => {
		const options: Options = {
			mediaType: 'photo',
		};

		if (option.startsWith('Take')) {
			const result: IImagePickerResult = await ImagePickerCropper.openCamera(options);

			if (!result.cancelled) {
				await PhotoEditor.Edit({
					path: result.path?.replace(Platform.OS === 'ios' ? 'file:///' : 'file://', ''),
					hiddenControls: [
						'clear',
						// 'crop',
						'draw',
						// 'save',
						'share',
						'sticker',
						'text',
					],
					onDone: modifiedImage => {
						prepareUploadingMedia({
							result,
							modifiedImage: (Platform.OS === 'ios' ? '' : 'file://') + modifiedImage,
						});
					},
					onCancel: () => {
						return;
					},
				});
			}
		} else {
			const result: IImagePickerResult = await ImagePickerCropper.openPicker(options);

			if (!result.cancelled) {
				await PhotoEditor.Edit({
					path: result.path?.replace(Platform.OS === 'ios' ? 'file:///' : 'file://', ''),
					hiddenControls: [
						'clear',
						// 'crop',
						'draw',
						// 'save',
						'share',
						'sticker',
						'text',
					],
					onDone: modifiedImage => {
						prepareUploadingMedia({
							result,
							modifiedImage: (Platform.OS === 'ios' ? '' : 'file://') + modifiedImage,
						});
					},
					onCancel: () => {
						return;
					},
				});
			}
		}
	}, []);

	const onOpenActionSheet = () => {
		// customize view android
		const userInterfaceStyle: 'light' | 'dark' | undefined = 'light';
		const options: Array<string> = ['Take photo', 'Select photo from library', 'Cancel'];
		const cancelButtonIndex: number = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			buttonIndex => {
				if (buttonIndex !== cancelButtonIndex) {
					handleShowImagePicker(options[buttonIndex as number]);
				}
			}
		);
	};

	useEffect(() => {
		if (imagePickerResponse?.path && authUser?.data?.email) {
			const fileToUpload = {
				type: 'image/jpg',
				fileName: imagePickerResponse?.path,
				uri: imagePickerResponse?.path,
			};
			dispatch(
				// @ts-ignore
				createFileUploadsAsync(fileToUpload, authUser?.data?.email, AbortUploadingController)
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, imageFormat, imagePickerResponse, authUser?.data?.email]);

	useEffect(() => {
		return () => {
			dispatch(restoreSingleFileUpload());
		};
	}, [dispatch]);

	const onSubmit = (values: InitialValues) => {
		const uniqueEmail = 'a' + uuid.v4() + '@arrtree.com';
		keyboardDismiss();

		dispatch(
			createRelativeAsync({
				userId: authUser.data.id,
				treeId: authUser.data.myTreeIdByParent1,
				newRelativeData: {
					firstName: values.firstName,
					lastName: values.lastName,
					gender: values.gender,
					birthdate: values.birthdate,
					isDeceased: deceased === 'yes' ? true : false,
					dateOfDeath: values.dateOfDeath,
					anniversaryDate: values.anniversaryDate,
					email: uniqueEmail,
					userPictureLink: fileUploads?.singleImageUrl,
					// * NOTE: other create user properties could be added here
				},
				questionnaireCase: QuestionnaireCases.AddSpouse,
				setting: {
					...questionnaireSettings,
					step1_AddSpouse: {
						isStep1Completed: false,
						formVariants: {
							married,
							deceased,
							details: values.details,
						},
					},
				},
			})
		);
	};

	const handleModalSubmit = async (): Promise<void> => {
		const updateUserResponse = await dispatch(
			updateUserByIdAsync({
				userId: authUser.data?.id,
				userData: {
					setting: {
						...questionnaireSettings,
						step1_AddSpouse: {
							isStep1Completed: true,
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
				Step 1/7
			</Text>
			<Box pb={8}>
				<Formik
					enableReinitialize
					initialValues={InitialValues}
					validationSchema={spouseDetailsSchema(married)}
					onSubmit={onSubmit}
				>
					{props => (
						<>
							<Box alignItems="center" justifyContent="center" mt={15} mb={5} width={'100%'}>
								<Box width={'90%'}>
									<Text>Are you married?</Text>
									<Radio.Group
										colorScheme="amber"
										name="married"
										accessibilityLabel="married"
										value={married}
										onChange={value => {
											props.handleReset();
											setMarried(value);
											setDeceased('no');
											setImagePickerResponse(null);
										}}
									>
										{FORM_VARIANTS.married.map(variants => (
											<Radio value={variants} key={variants} my={1} isDisabled={isDisabled}>
												<Text>{variants.charAt(0).toUpperCase() + variants.slice(1)}</Text>
											</Radio>
										))}
									</Radio.Group>
									{married === 'divorced' && (
										<>
											<Text my={1}>
												Would you like to add details about your ex spouse/partner?
											</Text>
											<Radio.Group
												name="details"
												colorScheme="amber"
												accessibilityLabel="details"
												value={props.values.details}
												onChange={props.handleChange('details')}
											>
												{FORM_VARIANTS.details.map(variants => (
													<Radio value={variants} key={variants} my={1} isDisabled={isDisabled}>
														<Text>{variants.charAt(0).toUpperCase() + variants.slice(1)}</Text>
													</Radio>
												))}
											</Radio.Group>
										</>
									)}

									{(married === 'yes' ||
										married === 'widowed' ||
										props.values.details === 'yes') && (
										<>
											<Text my={2}>Please enter details about your spouse/partner:</Text>
											<Box mt={4} justifyContent="center" alignItems="center">
												<TouchableOpacity onPress={onOpenActionSheet}>
													<FastImage
														source={
															imagePickerResponse?.path
																? {uri: imagePickerResponse?.path}
																: noGenderAvatarImage
														}
														resizeMode={FastImage.resizeMode.cover}
														style={styles.avatarImage}
													/>
												</TouchableOpacity>
											</Box>
											<Box>
												<CustomTextInput
													title="First Name"
													placeholder="First Name"
													marginTop={2}
													disabled={isDisabled}
													marginTopErrorLabel={-8}
													marginBottomErrorLabel={0}
													onChange={props.handleChange('firstName')}
													value={props.values.firstName}
													error={
														props.touched.firstName && props.errors.firstName
															? props.errors.firstName
															: null
													}
													onBlur={props.handleBlur('firstName')}
												/>
												<CustomTextInput
													title="Last Name"
													placeholder="Last Name"
													marginTop={2}
													disabled={isDisabled}
													marginTopErrorLabel={-8}
													marginBottomErrorLabel={0}
													onChange={props.handleChange('lastName')}
													value={props.values.lastName}
													error={
														props.touched.lastName && props.errors.lastName
															? props.errors.lastName
															: null
													}
													onBlur={props.handleBlur('lastName')}
												/>
												<CustomTextInput
													title="Birth date:"
													IconLeft={CalendarIcon}
													type={InputType.date}
													placeholder="Birth date"
													marginTop={2}
													disabled={isDisabled}
													marginTopErrorLabel={-8}
													marginBottomErrorLabel={0}
													onChange={props.handleChange('birthdate')}
													value={props.values.birthdate}
													error={
														props.touched.birthdate && props.errors.birthdate
															? props.errors.birthdate
															: null
													}
													onBlur={props.handleBlur('birthdate')}
												/>
												<Text>Deceased</Text>
												<Radio.Group
													colorScheme="amber"
													name="deceased"
													accessibilityLabel="deceased"
													value={deceased}
													onChange={value => {
														setDeceased(value);
														props.setFieldValue('dateOfDeath', '');
													}}
												>
													{FORM_VARIANTS.details.map(variants => (
														<Radio value={variants} key={variants} my={1} isDisabled={isDisabled}>
															<Text>{variants.charAt(0).toUpperCase() + variants.slice(1)}</Text>
														</Radio>
													))}
												</Radio.Group>
												{deceased === 'yes' && (
													<>
														<CustomTextInput
															title="Death date:"
															IconLeft={CalendarIcon}
															type={InputType.date}
															placeholder="Death date"
															marginTop={2}
															disabled={isDisabled}
															marginTopErrorLabel={-8}
															marginBottomErrorLabel={0}
															onChange={props.handleChange('dateOfDeath')}
															value={props.values.dateOfDeath}
															error={
																props.touched.dateOfDeath && props.errors.dateOfDeath
																	? props.errors.dateOfDeath
																	: null
															}
															onBlur={props.handleBlur('dateOfDeath')}
														/>
													</>
												)}
												<CustomTextInput
													title="Anniversary Date:"
													IconLeft={CalendarIcon}
													type={InputType.date}
													placeholder="Anniversary Date"
													marginTop={2}
													disabled={isDisabled}
													marginTopErrorLabel={-8}
													marginBottomErrorLabel={0}
													onChange={props.handleChange('anniversaryDate')}
													value={props.values.anniversaryDate}
													onBlur={props.handleBlur('anniversaryDate')}
												/>
												<CustomTextInput
													dropdownIcon
													title="Gender"
													type={InputType.gender}
													placeholder="Gender"
													marginTop={2}
													disabled={isDisabled}
													marginTopErrorLabel={-8}
													marginBottomErrorLabel={0}
													onChange={props.handleChange('gender')}
													value={props.values.gender}
													error={
														props.touched.gender && props.errors.gender ? props.errors.gender : null
													}
													onBlur={props.handleBlur('gender')}
												/>
											</Box>
										</>
									)}
								</Box>
							</Box>
							{(((married === 'yes' || married === 'widowed' || married === 'divorced') &&
								(deceased === 'yes' || deceased === 'no')) ||
								(married === 'widowed' && props.values.details === 'yes')) &&
								props.values.firstName &&
								props.values.lastName &&
								props.values.gender && (
									<CustomButton
										onPress={props.handleSubmit}
										title="Save"
										isNotDisabled={isDisabled}
										bgColor={isDisabled ? 'grey' : colors.primary}
									/>
								)}
							{(married === 'no' || props.values.details === 'no' || authUser.data?.spouse) && (
								<CustomButton marginTop={20} onPress={onNext} title="Next" />
							)}
						</>
					)}
				</Formik>
			</Box>
			<QuestionnaireInfoModal
				isModalVisible={isInfoModalVisible}
				setIsModalVisible={setIsInfoModalVisible}
			/>
			<SubmitQuestionnaireModal
				isModalVisible={isModalVisible}
				setIsModalVisible={setIsModalVisible}
				onSubmit={handleModalSubmit}
			/>
		</KeyboardAwareScrollView>
	);
};

export default AddSpouseScreen;
