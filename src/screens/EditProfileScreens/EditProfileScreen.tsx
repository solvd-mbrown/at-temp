import React, {useEffect, useState, useCallback} from 'react';

import {TouchableOpacity, Platform, Alert} from 'react-native';

import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import {Box} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import ImagePickerCropper from 'react-native-image-crop-picker';
import {useActionSheet} from '@expo/react-native-action-sheet';
import PhotoEditor from 'react-native-photo-editor';
import * as FileSystem from 'expo-file-system';
import {useNavigation} from '@react-navigation/native';

import {updateUserByIdAsync, userSelector} from '~redux/slices/user';
import {authSelector} from '~redux/slices/auth';
import {
	createFileUploadsAsync,
	fileUploadsSelector,
	restoreSingleFileUpload,
} from '~redux/slices/fileUploads';
import {getTreeInPartsByIdAsync, treeSelector} from '~redux/slices/tree';
import {useAppDispatch} from '~hooks/redux';

import {CustomTextInput, CustomButton} from '~shared';
import {noGenderAvatarImage} from '~images';
import {userNameSchema} from '~utils';

import styles from './styles';

type ImagePickerResponseType = {
	fileName: string | undefined;
	type?: string | undefined | null;
	path?: string;
	mime?: string;
	length?: number;
} | null;

type PrepareUploadingMediaPropsType = {
	options: {
		mediaTypes: string;
	};
	result: {
		fileSize?: number;
		size?: number | undefined;
		duration?: number;
		uri?: string;
		path?: string;
		rotation?: number | undefined;
		width?: number;
		height?: number;
		mime?: string | null | undefined;
	};
	modifiedImage?: string;
};

type Values = {firstName?: string; lastName?: string; maidenName?: string};

const EditProfileScreen = () => {
	const dispatch = useAppDispatch();
	const navigation = useNavigation();

	const user = useSelector(userSelector.getUser);
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const authUser = useSelector(authSelector.getAuthUser);

	const AbortUploadingController = new AbortController();
	const tree = useSelector(treeSelector.getTree);

	const {showActionSheetWithOptions} = useActionSheet();

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType>(null);
	const [avatar, setAvatar] = useState('');

	useEffect(() => {
		if (fileUploads?.singleImageUrl) {
			setAvatar(fileUploads?.singleImageUrl);
		} else {
			if (user?.data) {
				setAvatar(user?.data?.userPictureLink);
			}
		}
	}, [user?.data, fileUploads?.singleImageUrl]);

	useEffect(() => {
		return () => {
			setAvatar('');
			dispatch(restoreSingleFileUpload());
		};
	}, [dispatch]);

	const [imageFormat, setImageFormat] = useState<string>('');

	useEffect(() => {
		if (imagePickerResponse?.length! > 0 || imagePickerResponse?.path) {
			const fileToUpload = {
				type: Platform.OS === 'ios' ? imagePickerResponse?.mime : imageFormat,
				fileName: imagePickerResponse?.path,
				uri: imagePickerResponse?.path,
			};
			dispatch(createFileUploadsAsync(fileToUpload, authUser.data.email, AbortUploadingController));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, imagePickerResponse, imageFormat, authUser.data.email]);

	const prepareUploadingMedia = async ({result, modifiedImage}: PrepareUploadingMediaPropsType) => {
		// 100mb in kilobytes
		const limitedFileSize = 1e8;
		const modifiedPhotoSize = await FileSystem.getInfoAsync(modifiedImage as string);

		if (modifiedPhotoSize?.size! > limitedFileSize) {
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

		setImageFormat(result?.mime as string);

		setImagePickerResponse({
			path: modifiedImage,
			type: result?.mime,
			fileName: modifiedImage,
		});
	};

	const handleShowImagePicker = useCallback(async (option: string) => {
		const options = {
			mediaType: 'photo',
		};

		if (option.startsWith('Take')) {
			// @ts-ignore
			const result = await ImagePickerCropper.openCamera(options);
			// @ts-ignore
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
							// @ts-ignore
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
			// @ts-ignore
			const result = await ImagePickerCropper.openPicker(options);
			// @ts-ignore
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
							// @ts-ignore
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
		const userInterfaceStyle = 'light';
		const options = ['Take photo', 'Select photo from library', 'Cancel'];
		const cancelButtonIndex = options.length - 1;

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

	const onSubmit = async (values: Values) => {
		await dispatch(
			updateUserByIdAsync({
				userId: user?.data?.id,
				userData: {
					firstName: values?.firstName?.trim(),
					lastName: values?.lastName?.trim(),
					maidenName: values?.maidenName?.trim(),
					userPictureLink: avatar,
				},
			})
		);
		await dispatch(
			getTreeInPartsByIdAsync({
				treeId: tree?.data?.payload?.myTreeIdByParent1,
				userId:
					tree.data?.bottomPartTree[0]?.descendant?.length > 0
						? tree.data?.bottomPartTree[0]?.descendant[0]?.user?.identity
						: tree.data?.bottomPartTree[0]?.user?.identity,
			})
		);
		navigation.goBack();
	};

	return (
		<KeyboardAwareScrollView
			enableOnAndroid
			extraHeight={0}
			contentContainerStyle={styles.editProfileScreenScrollContainer}
		>
			<Box
				width="100%"
				height="100%"
				alignItems="center"
				justifyContent="center"
				backgroundColor="white"
				pb={8}
			>
				<Formik
					initialValues={{
						firstName: user?.data?.firstName,
						lastName: user?.data?.lastName,
						maidenName: user?.data?.maidenName,
					}}
					validationSchema={userNameSchema}
					onSubmit={onSubmit}
				>
					{props => (
						<>
							<TouchableOpacity onPress={onOpenActionSheet} style={styles.avatarContainer}>
								<FastImage
									source={avatar ? {uri: avatar} : noGenderAvatarImage}
									resizeMode={FastImage.resizeMode.cover}
									style={styles.avatarImage}
								/>
							</TouchableOpacity>
							<Box alignItems="center" justifyContent="center" mt={15} width={'100%'}>
								<Box width={'90%'}>
									<CustomTextInput
										title="First Name"
										placeholder="FirstName"
										onChange={props.handleChange('firstName')}
										value={props.values.firstName}
										error={props.touched.firstName && props.errors.firstName}
										onBlur={props.handleBlur('firstName')}
									/>
									<CustomTextInput
										title="Last Name"
										placeholder="Last Name"
										onChange={props.handleChange('lastName')}
										value={props.values.lastName}
										error={props.touched.lastName && props.errors.lastName}
										onBlur={props.handleBlur('lastName')}
									/>
									{user?.data?.gender.toLowerCase() !== 'male' && (
										<CustomTextInput
											title="Maiden Name"
											placeholder="Maiden Name"
											onChange={props.handleChange('maidenName')}
											value={props.values.maidenName}
											error={props.touched.maidenName && props.errors.maidenName}
											onBlur={props.handleBlur('maidenName')}
										/>
									)}
								</Box>
							</Box>
							<CustomButton onPress={props.handleSubmit} title="Save changes" />
						</>
					)}
				</Formik>
			</Box>
		</KeyboardAwareScrollView>
	);
};

export default EditProfileScreen;
