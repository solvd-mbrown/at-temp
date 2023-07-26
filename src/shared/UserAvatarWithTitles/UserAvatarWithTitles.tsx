import React, {useEffect, useState, useCallback, FC} from 'react';

import {TouchableOpacity, Platform, Alert} from 'react-native';

import {HStack, VStack, Icon} from 'native-base';
import FastImage from 'react-native-fast-image';
import {useNavigation, useTheme} from '@react-navigation/native';
import {Feather} from '@expo/vector-icons';
import {useSelector} from 'react-redux';
import {useActionSheet} from '@expo/react-native-action-sheet';
import ImagePickerCropper, {Options} from 'react-native-image-crop-picker';
import PhotoEditor from 'react-native-photo-editor';
import * as FileSystem from 'expo-file-system';

import {updateUserById, userSelector} from '~redux/slices/user';
import {authSelector, getUsedStorageReportByEmailAsync} from '~redux/slices/auth';
import {
	fileUploadsSelector,
	restoreSingleFileUpload,
	createFileUploadsAsync,
} from '~redux/slices/fileUploads';

import {AgeType} from '~types/AgeType';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';
import {ImagePickerResponseType} from '~types/ImagePickerResponseType';
import {PrepareUploadingMediaType} from '~types/PrepareUploadingMediaType';
import {IImagePickerResult} from '~interfaces/IImagePickerResult';
import {UserNameText} from '~shared';
import {noGenderAvatarImage} from '~images';
import {getTreeInPartsByIdAsync, treeSelector} from '~redux/slices/tree';

import styles from './styles';
import {useAppDispatch} from '~hooks/redux';

type UserAvatarWithTitlesPropsType = {
	username: string;
	age?: AgeType;
	image: string;
	userId: string;
};

const UserAvatarWithTitles: FC<UserAvatarWithTitlesPropsType> = ({
	username,
	age,
	image,
	userId,
}) => {
	const navigation =
		useNavigation<StackNavigationPropsWithParams<RouteStackList.EditProfileScreen>>();
	const {colors} = useTheme();
	const dispatch = useAppDispatch();

	const user = useSelector(userSelector.getUser);
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const authUser = useSelector(authSelector.getAuthUser);
	const tree = useSelector(treeSelector.getTree);

	const AbortUploadingController = new AbortController();

	const {showActionSheetWithOptions} = useActionSheet();

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType>(null);

	const updateUserAvatar = useCallback(async () => {
		dispatch(
			updateUserById({
				userId: user?.data?.id,
				userData: {
					userPictureLink: fileUploads?.singleImageUrl,
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
		await dispatch(getUsedStorageReportByEmailAsync(authUser.data.email));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, fileUploads?.singleImageUrl, user?.data?.id, user?.data?.myTreeIdByParent1]);

	useEffect(() => {
		if (fileUploads?.singleImageUrl) {
			updateUserAvatar();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fileUploads?.singleImageUrl]);

	useEffect(() => {
		return () => {
			dispatch(restoreSingleFileUpload());
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [imageFormat, setImageFormat] = useState('');

	useEffect(() => {
		//checking if we set image uri
		if (imagePickerResponse?.path) {
			const fileToUpload = {
				type: Platform.OS === 'ios' ? imagePickerResponse?.mime : imageFormat,
				fileName: imagePickerResponse?.path,
				uri: imagePickerResponse?.path,
			};
			dispatch(createFileUploadsAsync(fileToUpload, authUser.data.email, AbortUploadingController));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, imagePickerResponse, imageFormat]);

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

	const onEditIconPress = (): void =>
		navigation.navigate(RouteStackList.EditProfileScreen, {userId});

	return (
		<HStack
			justifyContent="flex-start"
			alignItems="center"
			paddingX={4}
			paddingY={4}
			bgColor="white"
		>
			<TouchableOpacity onPress={onOpenActionSheet}>
				<FastImage
					source={image ? {uri: image} : noGenderAvatarImage}
					resizeMode={FastImage.resizeMode.cover}
					style={styles.avatarImage}
				/>
			</TouchableOpacity>
			<VStack alignItems="flex-start" textAlign="left" flex="1" overflow="hidden">
				<UserNameText username={username} age={age} />
				{/* <FamilyMemberText
          familyMemberTitle={familyMemberTitle}
          generation={generation}
        /> */}
				<TouchableOpacity onPress={onEditIconPress}>
					<Icon as={Feather} name="edit" size="md" color={colors.primary} />
				</TouchableOpacity>
			</VStack>
		</HStack>
	);
};

export {UserAvatarWithTitles};
