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

import {noGenderAvatarImage} from '~images';
import {InputType, childrenSiblingSchema, QuestionnaireCases} from '~utils';
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
import {useTheme} from '@react-navigation/native';

const FORM_VARIANTS = {
	details: ['yes', 'no'],
	deceased: ['yes', 'no'],
};

type AddChildrenFormProps = {
	firstName?: string;
	lastName?: string;
	birthdate?: string;
	dateOfDeath?: string;
	gender?: string;
	userPictureLink?: string;
	childNumber: number;
	setNewChildDetails?: (details: string) => void;
	newChildDetails?: string;
	id?: number;
	newChild?: boolean;
	setLoading: (load: boolean) => void;
	keyboardDismiss: () => void;
};

const AddChildrenForm: FC<AddChildrenFormProps> = ({
	firstName,
	lastName,
	birthdate,
	dateOfDeath,
	gender,
	userPictureLink,
	childNumber,
	setNewChildDetails,
	newChildDetails,
	newChild,
	setLoading,
	keyboardDismiss,
}) => {
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const {colors} = useTheme();

	const [deceased, setDeceased] = useState<string>(
		newChild
			? ''
			: questionnaireSettings?.step2_AddChildren?.formVariants &&
			  questionnaireSettings?.step2_AddChildren?.formVariants[`child${childNumber}`]
			? questionnaireSettings?.step2_AddChildren?.formVariants[`child${childNumber}`]?.deceased
			: ''
	);
	const [details, setDetails] = useState<string>(
		newChild
			? ''
			: questionnaireSettings?.step2_AddChildren?.formVariants &&
			  questionnaireSettings?.step2_AddChildren?.formVariants[`child${childNumber}`]
			? questionnaireSettings?.step2_AddChildren?.formVariants[`child${childNumber}`]?.details
			: ''
	);

	const {showActionSheetWithOptions} = useActionSheet();

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType>(null);
	const [imageFormat, setImageFormat] = useState<string>('');
	const AbortUploadingController = new AbortController();

	const isDisabled = questionnaireSettings?.step2_AddChildren?.formVariants
		? questionnaireSettings?.step2_AddChildren?.formVariants[`child${childNumber}`]?.details ===
		  'yes'
			? true
			: false
		: false;

	const initialValues: InitialValues = {
		firstName: firstName ? firstName : '',
		lastName: lastName ? lastName : '',
		birthdate: birthdate ? birthdate : '',
		gender: gender ? gender : '',
		dateOfDeath: dateOfDeath ? dateOfDeath : '',
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
		setDetails('');
		setDeceased('');
		setLoading(true);
		keyboardDismiss();

		let response;

		if (authUser.data?.kids && authUser.data?.kids[childNumber - 1]) {
			response = await dispatch(
				updateFamilyMemberAndAuthUserAsync({
					authUserId: authUser.data?.id,
					userId: authUser.data?.kids[childNumber - 1]?.identity,
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
						step2_AddChildren: {
							isStep2Completed: false,
							formVariants: {
								...questionnaireSettings?.step2_AddChildren?.formVariants,
								[`child${childNumber}`]: {
									deceased,
									details: newChildDetails ? newChildDetails : details,
								},
							},
						},
					},
				})
			);
		} else {
			response = await dispatch(
				createRelativeAsync({
					userId: authUser.data.id,
					treeId: authUser.data.myTreeIdByParent1,
					// parents: authUser.data?.parents,
					newRelativeData: {
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
					questionnaireCase: QuestionnaireCases.AddChildren,
					setting: {
						...questionnaireSettings,
						step2_AddChildren: {
							isStep2Completed: false,
							formVariants: {
								...questionnaireSettings?.step2_AddChildren?.formVariants,
								[`child${childNumber}`]: {
									deceased,
									details: newChildDetails ? newChildDetails : details,
								},
							},
						},
					},
				})
			);
		}

		if (response) {
			setLoading(false);
		}
	};

	return (
		<Formik
			enableReinitialize
			initialValues={initialValues}
			validationSchema={childrenSiblingSchema}
			onSubmit={onSubmit}
		>
			{props => (
				<>
					<Box alignItems="center" justifyContent="center" mt={15} mb={5} width={'100%'}>
						<Box width={'90%'} position={'relative'}>
							<Text my={1}>{childNumber > 1 ? 'Add another child?' : 'Do you have children?'}</Text>
							<Radio.Group
								name="details"
								colorScheme="amber"
								accessibilityLabel="details"
								value={details}
								onChange={value => {
									props.handleReset();
									// setDetails(value);
									if (newChild && setNewChildDetails) {
										setNewChildDetails(value);
									}
									setDetails(value);
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
							{details === 'yes' && (
								<>
									<Text textAlign={'center'}>Child {childNumber}</Text>
									<Box mt={4} justifyContent="center" alignItems="center">
										<TouchableOpacity onPress={onOpenActionSheet}>
											<FastImage
												source={
													userPictureLink
														? {uri: userPictureLink}
														: imagePickerResponse?.path
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
					{details === 'yes' &&
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

export default AddChildrenForm;
