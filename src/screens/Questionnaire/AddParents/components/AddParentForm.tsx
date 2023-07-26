import React, {FC, useCallback, useEffect, useState} from 'react';

import {Alert, TouchableOpacity, Platform} from 'react-native';
import {Text, Box, Radio} from 'native-base';
import {Formik} from 'formik';
import FastImage from 'react-native-fast-image';
import {useActionSheet} from '@expo/react-native-action-sheet';
import ImagePickerCropper, {Options} from 'react-native-image-crop-picker';
import {useSelector} from 'react-redux';
import PhotoEditor from 'react-native-photo-editor';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import {useTheme} from '@react-navigation/native';

import {noGenderAvatarImage} from '~images';
import {InputType, parentDetailsSchema, QuestionnaireCases} from '~utils';
import {useAppDispatch} from '~hooks/redux';
import {CustomTextInput, CustomButton} from '~shared';
import {CalendarIcon} from '~shared/Icons';

import {authSelector, questionnaireSettingsSelector} from '~redux/slices/auth';
import {createRelativeAsync, updateFamilyMemberAndAuthUserAsync} from '~redux/slices/user';
import {
	createFileUploadsAsync,
	fileUploadsSelector,
	restoreSingleFileUpload,
} from '~redux/slices/fileUploads';

import {InitialValues} from '~types/InitialValues';
import {ImagePickerResponseType} from '~types/ImagePickerResponseType';
import {PrepareUploadingMediaType} from '~types/PrepareUploadingMediaType';
import {IImagePickerResult} from '~interfaces/IImagePickerResult';

import styles from './styles';

const FORM_VARIANTS = {
	details: ['yes', 'no'],
	deceased: ['yes', 'no'],
};

type AddParentFormProps = {
	parent1?: boolean | undefined;
	parent2?: boolean | undefined;
	detailsParent1?: string;
	detailsParent2?: string;
	setDetailsParent1?: (values: string) => void;
	setDetailsParent2?: (values: string) => void;
	keyboardDismiss: () => void;
};

const AddParentForm: FC<AddParentFormProps> = ({
	parent1,
	parent2,
	detailsParent1,
	detailsParent2,
	setDetailsParent1,
	setDetailsParent2,
	keyboardDismiss,
}) => {
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const {colors} = useTheme();

	const [deceased, setDeceased] = useState<string>(
		parent1
			? questionnaireSettings?.step3_AddParents?.formVariants?.parent1?.deceased
			: questionnaireSettings?.step3_AddParents?.formVariants?.parent2?.deceased
	);

	const {showActionSheetWithOptions} = useActionSheet();

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType>(null);
	const [imageFormat, setImageFormat] = useState<string>('');
	const AbortUploadingController = new AbortController();

	const isDisabled = !!(
		(parent1 && questionnaireSettings?.step3_AddParents?.formVariants?.parent1?.details) ||
		(parent2 && questionnaireSettings?.step3_AddParents?.formVariants?.parent2?.details)
	);

	const getInitialValues = (): InitialValues => {
		let InitialValues = {
			firstName: '',
			lastName: '',
			birthdate: '',
			gender: '',
			dateOfDeath: '',
			anniversaryDate: '',
		};

		if (authUser?.data?.parents?.length > 0) {
			InitialValues.firstName = parent1
				? authUser?.data?.parents[0]?.properties?.firstName
				: authUser?.data?.parents[1]?.properties?.firstName;
			InitialValues.lastName = parent1
				? authUser?.data?.parents[0]?.properties?.lastName
				: authUser?.data?.parents[1]?.properties?.lastName;
			InitialValues.birthdate = parent1
				? authUser?.data?.parents[0]?.properties?.birthdate
				: authUser?.data?.parents[1]?.properties?.birthdate;
			InitialValues.gender = parent1
				? authUser?.data?.parents[0]?.properties?.gender
				: authUser?.data?.parents[1]?.properties?.gender;
			InitialValues.dateOfDeath = parent1
				? authUser?.data?.parents[0]?.properties?.dateOfDeath
				: authUser?.data?.parents[1]?.properties?.dateOfDeath;
			InitialValues.anniversaryDate = parent1
				? authUser?.data?.parents[0]?.properties?.anniversaryDate
				: authUser?.data?.parents[1]?.properties?.anniversaryDate;
		}

		return InitialValues;
	};

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
		if (isDisabled) {
			return;
		}
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

	const onSubmit = async (values: InitialValues) => {
		const uniqueEmail = 'a' + uuid.v4() + '@arrtree.com';
		keyboardDismiss();

		if (
			authUser.data?.parents &&
			((parent1 && authUser?.data?.parents[0]) || (parent2 && authUser?.data?.parents[1]))
		) {
			await dispatch(
				updateFamilyMemberAndAuthUserAsync({
					authUserId: authUser.data?.id,
					userId: parent1
						? authUser?.data?.parents[0]?.identity
						: authUser?.data?.parents[1]?.identity,
					userData: {
						firstName: values.firstName,
						lastName: values.lastName,
						gender: values.gender,
						birthdate: values.birthdate,
						isDeceased: deceased === 'yes' ? true : false,
						dateOfDeath: values.dateOfDeath,
						email: uniqueEmail,
						userPictureLink: fileUploads?.singleImageUrl,
						// * NOTE: other create user properties could be added here
					},
					setting: {
						...questionnaireSettings,
						step3_AddParents: {
							isStep3Completed: false,
							isParent1Added: parent1
								? true
								: questionnaireSettings?.step3_AddParents?.isParent1Added,
							isParent2Added: parent2
								? true
								: questionnaireSettings?.step3_AddParents?.isParent2Added,
							formVariants: {
								parent1: {
									details: parent1
										? detailsParent1
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent1?.details,
									deceased: deceased
										? deceased
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent1?.deceased,
								},
								parent2: {
									details: parent2
										? detailsParent2
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent2?.details,
									deceased: deceased
										? deceased
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent2?.deceased,
								},
							},
						},
					},
				})
			);
		} else {
			await dispatch(
				createRelativeAsync({
					userId: authUser.data.id,
					treeId: authUser.data.myTreeIdByParent1,
					parents: authUser.data?.parents,
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
					questionnaireCase: QuestionnaireCases.AddParent1,
					setting: {
						...questionnaireSettings,
						step3_AddParents: {
							isStep3Completed: false,
							isParent1Added: parent1
								? true
								: questionnaireSettings?.step3_AddParents?.isParent1Added,
							isParent2Added: parent2
								? true
								: questionnaireSettings?.step3_AddParents?.isParent2Added,
							formVariants: {
								parent1: {
									details: parent1
										? detailsParent1
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent1?.details,
									deceased: deceased
										? deceased
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent1?.deceased,
								},
								parent2: {
									details: parent2
										? detailsParent2
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent2?.details,
									deceased: deceased
										? deceased
										: questionnaireSettings?.step3_AddParents?.formVariants?.parent2?.deceased,
								},
							},
						},
					},
				})
			);
		}

		// }
		//  else {
		// 	dispatch(
		// 		updateUserById({
		// 			userId: parent1
		// 				? authUser?.data?.parents[0]?.identity
		// 				: authUser?.data?.parents[1]?.identity,
		// 			userData: {
		// 				firstName: values.firstName,
		// 				lastName: values.lastName,
		// 				gender: values.gender,
		// 				birthdate: values.birthdate,
		// 				dateOfDeath: values.dateOfDeath,
		// 				userPictureLink: fileUploads?.singleImageUrl,
		// 				// * NOTE: other update user properties could be added here
		// 			},
		// 		})
		// 	);
		// }
	};

	return (
		<Formik
			enableReinitialize
			initialValues={getInitialValues()}
			validationSchema={parentDetailsSchema}
			onSubmit={onSubmit}
		>
			{props => (
				<>
					<Box alignItems="center" justifyContent="center" mt={15} mb={5} width={'100%'}>
						<Box width={'90%'}>
							<Text my={1}>
								Would you like to add details about your {parent1 ? 'father' : 'mother'}?
							</Text>
							<Radio.Group
								name="details"
								colorScheme="amber"
								accessibilityLabel="details"
								value={parent1 && detailsParent1 ? detailsParent1 : detailsParent2}
								onChange={value => {
									props.handleReset();
									parent1 && setDetailsParent1 && setDetailsParent1(value);
									parent2 && setDetailsParent2 && setDetailsParent2(value);
									setDeceased('no');
									setImagePickerResponse(null);
								}}
							>
								{FORM_VARIANTS.details.map(variants => (
									<Radio value={variants} key={variants} my={1} isDisabled={isDisabled}>
										<Text>{variants.charAt(0).toUpperCase() + variants.slice(1)}</Text>
									</Radio>
								))}
							</Radio.Group>
							{(detailsParent1 === 'yes' || detailsParent2 === 'yes') && (
								<>
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
											props.touched.lastName && props.errors.lastName ? props.errors.lastName : null
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
										error={props.touched.gender && props.errors.gender ? props.errors.gender : null}
										onBlur={props.handleBlur('gender')}
									/>
								</>
							)}
						</Box>
					</Box>
					{(detailsParent1 === 'yes' || detailsParent2 === 'yes') &&
						props.values.firstName &&
						props.values.lastName &&
						props.values.gender && (
							<CustomButton
								onPress={props.handleSubmit}
								isNotDisabled={isDisabled}
								bgColor={isDisabled ? 'grey' : colors.primary}
								title="Save"
							/>
						)}
				</>
			)}
		</Formik>
	);
};

export default AddParentForm;
