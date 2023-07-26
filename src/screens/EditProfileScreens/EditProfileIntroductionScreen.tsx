import React, {FC, useCallback, useEffect, useRef, useState} from 'react';

import {Alert, Image, Keyboard, Platform, TextInput, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {AspectRatio, Box, CloseIcon, Icon} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import FastImage from 'react-native-fast-image';
import {AntDesign, Ionicons, MaterialIcons} from '@expo/vector-icons';
import {useActionSheet} from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import {ResizeMode, Video as ExpoVideo} from 'expo-av';
import Video from 'react-native-video';
import ImagePickerCropper from 'react-native-image-crop-picker';
import PhotoEditor from 'react-native-photo-editor';
import {scale} from 'react-native-utils-scale';
import * as FileSystem from 'expo-file-system';

import {authSelector} from '~redux/slices/auth';
import {updateUserById} from '~redux/slices/user';

import {CustomButton} from '~shared';

import {
	createFilesUploadsAsync,
	fileUploadsSelector,
	restoreFileUploads,
} from '~redux/slices/fileUploads';

import styles from './styles';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';
import {useAppDispatch} from '~hooks/redux';

type ImagePickerResponseType =
	| [
			{fileName: string | undefined; uri: string | undefined; type?: string | undefined},
			{uri: string | undefined; type: string; fileName: string | undefined}
	  ]
	| [
			{
				uri: string | undefined;
				type: string | undefined;
				fileName: string | undefined;
			}
	  ]
	| null;

type prepareUploadingMediaPropsType = {
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
		mime?: string;
	};
	modifiedImage?: string;
};

type EditProfileIntroductionScreenProps =
	StackScreenPropsWithParams<RouteStackList.EditProfileIntroductionScreen>;

const EditProfileIntroductionScreen: FC<EditProfileIntroductionScreenProps> = ({
	route,
	navigation,
}) => {
	const {
		type,
		text,
		images,
		video,
		poster,
		description,
		elementIndex,
		parsedIntroduction,
		sectionType,
		userId,
		mediaParameters,
	} = route.params;

	const {colors} = useTheme();
	const videoRef = useRef<any>(null);

	const inputRef = useRef<any>(null);

	// description only for Text components in EditIntroductionList
	const [textValue, setTextValue] = useState('');
	const [arrImages, setArrImages] = useState<
		[{imageLink: string}] | {[key: string]: string}[] | []
	>([]);
	const [videoLink, setVideoLink] = useState('');

	// description only for Image and Video components in EditIntroductionList
	const [descriptionValue, setDescriptionValue] = useState('');
	const [videoPoster, setVideoPoster] = useState('');

	const dispatch = useAppDispatch();
	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);
	const authUser = useSelector(authSelector.getAuthUser);

	const [imageWidth, setImageWidth] = useState(1);
	const [imageHeight, setImageHeight] = useState(1);
	const [videoWidth, setVideoWidth] = useState(1);
	const [videoHeight, setVideoHeight] = useState(1);
	const AbortUploadingController = new AbortController();

	const [mediaParams, setMediaParams] = useState<{
		width: number | undefined;
		height: number | undefined;
	} | null>(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [sectionType]);

	useEffect(() => {
		if (text) {
			setTextValue(text);
		}
	}, [text]);

	useEffect(() => {
		if (images) {
			setArrImages(images);
		}
	}, [images]);

	useEffect(() => {
		if (video) {
			setVideoLink(video);
		}
	}, [video]);

	useEffect(() => {
		if (description) {
			setDescriptionValue(description);
		}
	}, [description]);

	useEffect(() => {
		if (poster) {
			setVideoPoster(poster);
		}
	}, [poster]);

	useEffect(() => {
		if (mediaParameters) {
			setMediaParams(mediaParameters);
		}
	}, [mediaParameters]);

	const [saving, setSaving] = useState(false);

	useEffect(
		() =>
			navigation.addListener(
				'beforeRemove',
				(e: {preventDefault: () => void; data: {action: any}}) => {
					if (
						saving ||
						(textValue && textValue === text) ||
						(description &&
							descriptionValue === description &&
							((video && videoLink === video) ||
								(arrImages[0]?.imageLink && arrImages[0]?.imageLink === images![0]?.imageLink)))
					) {
						// If we don't have unsaved changes, then we don't need to do anything
						return;
					}
					// when create new image component, added image and want to go back

					if (
						!descriptionValue &&
						!description &&
						!arrImages[0]?.imageLink &&
						!images &&
						!text &&
						!textValue &&
						!videoLink &&
						!video
					) {
						return;
					}
					// when create new video component, added video and want to go back

					if (
						!descriptionValue &&
						!description &&
						!videoLink &&
						!video &&
						!text &&
						!textValue &&
						!arrImages[0]?.imageLink &&
						!images
					) {
						return;
					}

					if (!descriptionValue && !description && video === videoLink) {
						return;
					}

					if (arrImages[0]?.imageLink && images)
						if (
							!descriptionValue &&
							!description &&
							arrImages[0]?.imageLink === images![0]?.imageLink
						) {
							return;
						}

					// Prevent default behavior of leaving the screen
					e.preventDefault();

					// Prompt the user before leaving the screen
					Alert.alert(
						'Discard changes?',
						'You have unsaved changes. Are you sure to discard them and leave the screen?',
						[
							{text: "Don't leave", style: 'cancel', onPress: () => {}},
							{
								text: 'Discard',
								style: 'destructive',
								// If the user confirmed, then we dispatch the action we blocked earlier
								// This will continue the action that had triggered the removal of the screen
								onPress: () => {
									navigation.dispatch(e.data.action);
									dispatch(restoreFileUploads());
								},
							},
						]
					);
				}
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			navigation,
			description,
			descriptionValue,
			text,
			textValue,
			images,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			arrImages[0]?.imageLink,
			video,
			videoLink,
			saving,
		]
	);

	const onPressHandler = async () => {
		//TODO Rewrite!!!
		//we need await for useEffect with beforeRemove event, without await useEffect fires before setting true in setSaving state
		await setSaving(true);
		if (type === 'text') {
			if (textValue?.length > 0) {
				const dispatchData = parsedIntroduction;

				if (!elementIndex && elementIndex !== 0) {
					dispatchData![sectionType]?.push({type, text: textValue});
				} else {
					dispatchData![sectionType][elementIndex].text = textValue;
				}

				dispatch(
					updateUserById({
						userId,
						userData: {
							introduction: dispatchData,
						},
					})
				);

				navigation.navigate(RouteStackList.EditIntroductionListScreen, {
					userId,
					sectionType,
				});
			}
		}

		if (type === 'images') {
			if (parsedIntroduction && arrImages?.length > 0) {
				const dispatchData = parsedIntroduction;
				if (!elementIndex && elementIndex !== 0) {
					dispatchData[sectionType]?.push({
						type: type,
						images: arrImages,
						description: descriptionValue,
						mediaParams,
					});
				} else {
					if (arrImages && arrImages?.length) {
						dispatchData[sectionType][elementIndex].images = arrImages;
						dispatchData[sectionType][elementIndex].description = descriptionValue;
						dispatchData[sectionType][elementIndex].mediaParams = mediaParams;
					}
				}

				dispatch(
					updateUserById({
						userId,
						userData: {
							introduction: dispatchData,
						},
					})
				);

				navigation.navigate(RouteStackList.EditIntroductionListScreen, {
					userId,
					sectionType,
				});
			}
		}

		if (type === 'video') {
			if (parsedIntroduction && videoLink && videoPoster) {
				const dispatchData = parsedIntroduction;
				if (!elementIndex && elementIndex !== 0) {
					dispatchData[sectionType]?.push({
						type: type,
						video: videoLink,
						description: descriptionValue,
						videoPoster,
						mediaParams,
					});
				} else {
					if (videoLink && videoPoster) {
						dispatchData[sectionType][elementIndex].video = videoLink;
						dispatchData[sectionType][elementIndex].description = descriptionValue;
						dispatchData[sectionType][elementIndex].videoPoster = videoPoster;
						dispatchData[sectionType][elementIndex].mediaParams = mediaParams;
					}
				}

				dispatch(
					updateUserById({
						userId,
						userData: {
							introduction: dispatchData,
						},
					})
				);

				navigation.navigate(
					'EditIntroductionListScreen' as RouteStackList.EditProfileIntroductionScreen,
					{
						userId,
						sectionType,
					}
				);
			}
		}
	};

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType | []>([]);

	const {showActionSheetWithOptions} = useActionSheet();

	const [imageFormat, setImageFormat] = useState<string | undefined>('');

	useEffect(() => {
		if (imagePickerResponse) {
			if (imagePickerResponse?.length > 0 && imageFormat) {
				const imagesGallery = imagePickerResponse.map(({type, fileName, uri}) => ({
					type: Platform.OS === 'ios' ? type : imageFormat,
					fileName: fileName,
					uri: Platform.OS === 'ios' ? uri?.replace('file://', '') : uri,
				}));

				dispatch(
					createFilesUploadsAsync(imagesGallery, authUser.data.email, AbortUploadingController)
				);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, imagePickerResponse, imageFormat]);

	const addNewImage = (imagesGallery: [{imageLink: string}] | []) => {
		//recover it for CaruselCards later
		// setArrImages(currState => [...currState, ...imagesGallery]);
		setArrImages(imagesGallery);
	};

	useEffect(() => {
		if (fileUploads?.multiImageUrl && fileUploads?.multiImageUrl.length > 0) {
			const isVideo = ['.mp4', '.webm', '.mov', '.m4v', '.avi'].some(endings =>
				fileUploads?.multiImageUrl[0]?.toLowerCase().endsWith(endings)
			);
			if (isVideo) {
				setVideoPoster(fileUploads?.multiImageUrl[1]);
				setVideoLink(fileUploads?.multiImageUrl[0]);
				addNewImage([]);
				return;
			} else {
				const preparedArray = fileUploads?.multiImageUrl?.map((imageLink: string) => ({
					imageLink,
				}));

				setVideoLink('');
				addNewImage(preparedArray);
			}
		}
	}, [fileUploads?.multiImageUrl]);

	const deletePhoto = () => {
		// setArrImages(currState =>
		//   [...currState].filter((_, index) => indexCard !== index),
		// );
		setArrImages([]);
		// dispatch(restoreFileUploads());
	};

	const prepareUploadingMedia = async ({
		options,
		result,
		modifiedImage,
	}: prepareUploadingMediaPropsType) => {
		try {
			//@ts-ignore
			const {uri} =
				options.mediaTypes === 'Videos' &&
				(await VideoThumbnails.getThumbnailAsync(result?.uri!, {
					time: result?.duration! - 10,
				}));
			const limitedFileSize = 1e8;
			const androidVideoData = result.uri && (await FileSystem.getInfoAsync(result.uri));
			const fileSize =
				Platform.OS === 'ios'
					? result.fileSize
					: options.mediaTypes === 'Videos'
					? //@ts-ignore
					  androidVideoData?.size
					: result.size;

			if (fileSize > limitedFileSize) {
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

			let filename =
				options.mediaTypes === 'Videos'
					? result?.uri?.split('/').pop()
					: modifiedImage
					? modifiedImage.split('/').pop()
					: Platform.OS === 'ios'
					? result?.path?.split('/').pop()
					: result?.uri?.split('/').pop();
			let match = options.mediaTypes === 'Videos' && /\.(\w+)$/.exec(filename as string);

			let format = options.mediaTypes === 'Videos' && match ? `${type}/${match[1]}` : type;

			setImageFormat(options.mediaTypes === 'Videos' ? format : result.mime);

			setImagePickerResponse(
				options.mediaTypes === 'Videos'
					? [
							{fileName: result.uri, uri: result.uri},
							{uri, type: 'image/jpg', fileName: uri.split('/VideoThumbnails/')[1]},
					  ]
					: [
							{
								uri: modifiedImage ? modifiedImage : result.path,
								type: result.mime,
								fileName: result.path,
							},
					  ]
			);
			setMediaParams(
				Platform.OS !== 'ios'
					? options.mediaTypes === 'Videos'
						? {
								height: result?.rotation === 90 ? result?.width : result?.height,
								width: result.rotation === 90 ? result.height : result.width,
						  }
						: null
					: null
			);
		} catch (e) {
			console.warn(e);
		}
	};

	const handleShowImagePicker = useCallback(async (option: string, type: string | undefined) => {
		const options = {
			mediaTypes:
				type === 'images'
					? ImagePicker.MediaTypeOptions.Images
					: ImagePicker.MediaTypeOptions.Videos,
		};

		if (option.startsWith('Take')) {
			const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

			if (permissionResult.granted === false) {
				Alert.alert("You've refused to allow this app to access your photos!");
				return;
			}

			const result =
				options.mediaTypes !== 'Videos'
					? await ImagePickerCropper.openCamera({
							mediaType: 'photo',
					  })
					: await ImagePicker.launchCameraAsync({
							mediaTypes:
								type === 'image'
									? ImagePicker.MediaTypeOptions.Images
									: ImagePicker.MediaTypeOptions.Videos,
					  });

			if (options.mediaTypes === 'Videos') {
				// @ts-ignore
				if (!result?.cancelled) {
					// @ts-ignore
					prepareUploadingMedia({options, result});
				}
			} else {
				// @ts-ignore
				!result.cancelled &&
					(await PhotoEditor.Edit({
						// @ts-ignore
						path: result?.path?.replace(Platform.OS === 'ios' ? 'file:///' : 'file://', ''),
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
								options,
								// @ts-ignore
								result,
								modifiedImage: (Platform.OS === 'ios' ? '' : 'file://') + modifiedImage,
							});
						},
						onCancel: () => {
							return;
						},
					}));
			}
		} else {
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (permissionResult.granted === false) {
				Alert.alert("You've refused to allow this app to access your photos!");
				return;
			}

			const result =
				options.mediaTypes !== 'Videos'
					? await ImagePickerCropper.openPicker({
							mediaType: 'photo',
					  })
					: await ImagePicker.launchImageLibraryAsync({
							aspect: [16, 10],
							quality: 1,
							mediaTypes:
								type === 'images'
									? ImagePicker.MediaTypeOptions.Images
									: ImagePicker.MediaTypeOptions.Videos,
					  });

			if (options.mediaTypes === 'Videos') {
				// @ts-ignore
				if (!result.cancelled) {
					// @ts-ignore

					prepareUploadingMedia({options, result});
				}
			} else {
				// @ts-ignore

				!result?.cancelled &&
					(await PhotoEditor.Edit({
						// @ts-ignore

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
								options,
								// @ts-ignore
								result,
								modifiedImage: (Platform.OS === 'ios' ? '' : 'file://') + modifiedImage,
							});
						},
						onCancel: () => {
							return;
						},
					}));
			}
		}
		setArrImages([]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onOpenActionSheet = (type: string | undefined) => {
		// customize view android
		Keyboard.dismiss();
		const userInterfaceStyle = 'light';
		const options = [`Take ${type}`, `Select ${type} from library`, 'Cancel'];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			buttonIndex => {
				if (buttonIndex !== cancelButtonIndex) {
					handleShowImagePicker(options[buttonIndex as number], type);
				}
			}
		);
	};
	const onOpenActionSheetOnPress = () =>
		// @ts-ignore
		(!arrImages.length > 0 || !videoLink) && onOpenActionSheet(type);

	const removeVideoLink = () => setVideoLink('');

	const resizeImageOnLoad = () => {
		Image.getSize(
			arrImages[0]!.imageLink,
			(width1, height1) => {
				!mediaParams && setImageWidth(width1);
				!mediaParams && setImageHeight(height1);
			},
			error => {
				console.error('ScaledImage,Image.getSize failed with error: ', error);
			}
		);
	};

	type resizeVideoOnLoadProps = {
		naturalSize: {
			width: number;
			height: number;
			orientation: string;
		};
	};

	const resizeVideoOnLoad = ({
		naturalSize: {width, height, orientation},
	}: resizeVideoOnLoadProps): void => {
		!mediaParams && setVideoWidth(orientation === 'landscape' ? width : height);
		!mediaParams && setVideoHeight(orientation === 'landscape' ? height : width);
	};

	const onPlaybackStatusUpdateHendler = (status: any) => {
		// @ts-ignore
		if (status.didJustFinish) {
			videoRef?.current?.replayAsync();
			videoRef?.current?.pauseAsync();
		}
	};

	return (
		<KeyboardAwareScrollView
			contentContainerStyle={styles.scrollContainer}
			keyboardShouldPersistTaps="handled"
		>
			<Box>
				{type === 'text' ? (
					<Box padding={5}>
						<TextInput
							placeholder="Start typing your text..."
							onChangeText={setTextValue}
							value={textValue}
							ref={inputRef}
							multiline
							editable
						/>
					</Box>
				) : (
					// <CarouselCards
					//   images={images}
					//   editable={editable}
					//   componentType={type}
					//   sectionType={sectionType}
					//   elementIndex={elementIndex}
					//   parsedIntroduction={parsedIntroduction}
					//   userId={userId}
					// />
					<Box marginBottom={4}>
						{type === 'images' && (
							<>
								<Box padding={5}>
									<TextInput
										style={styles.textInput}
										placeholder="Start typing your text..."
										onChangeText={setDescriptionValue}
										value={descriptionValue}
										ref={inputRef}
										multiline
										editable
									/>
								</Box>
								{arrImages?.length ? (
									<>
										<AspectRatio
											w="100%"
											ratio={
												mediaParams
													? mediaParams?.width! / mediaParams?.height!
													: imageWidth / imageHeight
											}
											marginBottom={8}
										>
											<FastImage
												source={{uri: arrImages[0]?.imageLink}}
												resizeMode={FastImage.resizeMode.contain}
												// style={styles.image}
												onLayout={resizeImageOnLoad}
											>
												<Box justifyContent="flex-end" alignItems="flex-end" padding={scale(4)}>
													<TouchableOpacity
														// @ts-ignore
														underlayColor={'#DDDDD'}
														activeOpacity={0.7}
														style={styles.button}
														onPress={deletePhoto}
													>
														{Platform.OS === 'ios' ? (
															<CloseIcon />
														) : (
															<Icon
																color={'red.300'}
																as={Ionicons}
																name="md-close-sharp"
																size={5}
															/>
														)}
													</TouchableOpacity>
												</Box>
											</FastImage>
										</AspectRatio>
									</>
								) : null}
							</>
						)}

						{type === 'video' && (
							<>
								<Box>
									<TextInput
										style={styles.textInput}
										placeholder="Start typing your text..."
										onChangeText={setDescriptionValue}
										value={descriptionValue}
										ref={inputRef}
										multiline
										editable
									/>
								</Box>
								{videoLink ? (
									<>
										<AspectRatio
											w="100%"
											ratio={
												mediaParams
													? mediaParams?.width! / mediaParams?.height!
													: videoWidth / videoHeight
											}
											marginBottom={2}
										>
											{Platform.OS === 'ios' ? (
												<Video
													source={{uri: videoLink}} // Can be a URL or a local file.
													ref={ref => (videoRef.current = ref)} // Store reference
													// onBuffer={this.onBuffer} // Callback when remote video is buffering
													// onError={this.videoError} // Callback when video cannot be loaded
													style={styles.video}
													volume={1.0}
													muted={false}
													ignoreSilentSwitch="ignore"
													controls
													resizeMode="contain"
													fullscreenAutorotate
													paused={true}
													onLoad={resizeVideoOnLoad}
												/>
											) : (
												<ExpoVideo
													ref={videoRef}
													style={styles.video}
													source={{
														uri: videoLink,
													}}
													useNativeControls
													resizeMode={ResizeMode.CONTAIN}
													onPlaybackStatusUpdate={onPlaybackStatusUpdateHendler}
													onReadyForDisplay={resizeVideoOnLoad}
												/>
											)}
										</AspectRatio>
										<Box
											alignSelf="flex-end"
											justifyContent="flex-end"
											alignItems="flex-end"
											padding={scale(2)}
											marginBottom={8}
										>
											<TouchableOpacity
												// @ts-ignore
												underlayColor={'#DDDDD'}
												activeOpacity={0.7}
												style={styles.button}
												onPress={removeVideoLink}
											>
												<Icon
													as={AntDesign}
													name="delete"
													size={6}
													color={'black'}
													marginRight={1}
												/>
											</TouchableOpacity>
										</Box>
									</>
								) : null}
							</>
						)}

						{/* <CustomButton
              isBordered
              fontSize={16}
              textColor={'black'}
              onPress={() => onOpenActionSheet('image')}
              icon={
                <Icon
                  as={MaterialIcons}
                  name="add-photo-alternate"
                  size={6}
                  color={'black'}
                  marginRight={1}
                />
              }
              title={'Add photo'}
              bgColor="#EFF2F5"
            /> */}
						<CustomButton
							// @ts-ignore
							isNotDisabled={arrImages.length > 0 || videoLink}
							isBordered
							fontSize={16}
							textColor={arrImages.length || videoLink ? '#DDDDDD' : 'black'}
							onPress={() => onOpenActionSheetOnPress()}
							icon={
								<Icon
									as={MaterialIcons}
									name="add-photo-alternate"
									size={6}
									color={arrImages.length || videoLink ? '#DDDDDD' : 'black'}
									marginRight={1}
								/>
							}
							title={`Add ${type === 'images' ? 'photo' : type}`}
							bgColor="#EFF2F5"
						/>
					</Box>
				)}
				<CustomButton
					isNotDisabled={!arrImages.length && !textValue.length && !videoLink}
					isBordered
					textColor={arrImages.length || textValue.length || videoLink ? colors.primary : '#DDDDDD'}
					onPress={onPressHandler}
					title="Save changes"
				/>
			</Box>
		</KeyboardAwareScrollView>
	);
};

export default EditProfileIntroductionScreen;
