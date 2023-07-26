import React, {useEffect, useState, useRef, useCallback, FC} from 'react';

import {TextInput, TouchableOpacity, Platform, Image, Keyboard, Alert} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Box, AspectRatio, CloseIcon, Icon} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useActionSheet} from '@expo/react-native-action-sheet';
import FastImage from 'react-native-fast-image';
import {MaterialIcons, AntDesign, Feather, Ionicons} from '@expo/vector-icons';
import {Video as ExpoVideo} from 'expo-av';
import Video from 'react-native-video';
import ImagePickerCropper from 'react-native-image-crop-picker';
import * as ImagePicker from 'expo-image-picker';
import PhotoEditor from 'react-native-photo-editor';
import * as FileSystem from 'expo-file-system';
import {scale} from 'react-native-utils-scale';

import {
	createFilesUploadsAsync,
	fileUploadsSelector,
	restoreFileUploads,
} from '~redux/slices/fileUploads';
import {
	createPostAsync,
	cleanNewPostData,
	postsSelector,
	getSinglePostByIdAsync,
	updatePostByIdAsync,
	cleanSinglePost,
} from '~redux/slices/posts';
import {authSelector} from '~redux/slices/auth';

import {CustomButton} from '~shared';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

import {styles} from './styles';
import {useAppDispatch} from '~hooks/redux';
import {parseStringToJSONdata} from "~utils";

type MediaParamsType = {
	width?: number;
	height?: number;
};

type ImagePickerResponseType =
	| [{uri: string | undefined; type?: string | undefined; fileName: string | undefined}]
	| null;

type EditPostScreen = StackScreenPropsWithParams<RouteStackList.EditPostScreen>;

type PrepareUploadingMediaPropsType = {
	options: {
		mediaTypes: string;
	};
	result: {
		fileSize?: number;
		size?: number | undefined;
		uri?: string | undefined;
		path?: string;
		rotation?: number | undefined;
		width?: number;
		height?: number;
		mime?: string;
	};
	modifiedImage?: string;
};

const EditPostScreen: FC<EditPostScreen> = ({route, navigation}) => {
	const {type, treeId, postId} = route.params;

	const {colors} = useTheme();

	const videoRef = useRef(null);
	const inputRef = useRef(null);
	const singlePost = useSelector(postsSelector.getSinglePost);
	const [textValue, setTextValue] = useState<string>('');
	const [arrImages, setArrImages] = useState<[{imageLink: string}] | []>([]);
	const [video, setVideo] = useState<string>('');
	const [imageFormat, setImageFormat] = useState<string | undefined>('');
	const authUser = useSelector(authSelector.getAuthUser);
	const AbortUploadingController = new AbortController();

	const dispatch = useAppDispatch();

	const [imageWidth, setImageWidth] = useState(1);
	const [imageHeight, setImageHeight] = useState(1);
	const [videoWidth, setVideoWidth] = useState(1);
	const [videoHeight, setVideoHeight] = useState(1);

	const [mediaParams, setMediaParams] = useState<MediaParamsType | null>(null);

	const [imagePickerResponse, setImagePickerResponse] = useState<ImagePickerResponseType>(null);

	const {showActionSheetWithOptions} = useActionSheet();

	const fileUploads = useSelector(fileUploadsSelector.getFileUploads);

	const [saving, setSaving] = useState(false);

	useEffect(
		() =>
			navigation.addListener(
				'beforeRemove',
				(e: {preventDefault: () => void; data: {action: any}}) => {
					const postData = singlePost?.postBody && parseStringToJSONdata(singlePost?.postBody);
					if (
						saving ||
						(postData?.description &&
							textValue === postData?.description &&
							((video && video === postData?.video) ||
								(arrImages[0]?.imageLink && arrImages[0]?.imageLink === postData?.image[0])))
					) {
						// If we don't have unsaved changes, then we don't need to do anything
						return;
					}

					// post with text but without photo or video
					if (
						textValue &&
						postData?.description &&
						postData?.description === textValue &&
						!arrImages[0]?.imageLink &&
						!postData?.image &&
						!postData?.video &&
						!video
					) {
						return;
					}

					// when create new post with image component, added image and want to go back

					if (
						!textValue &&
						!postData?.description &&
						!arrImages[0]?.imageLink &&
						!postData?.image &&
						!postData?.video &&
						!video
					) {
						return;
					}
					// when create new post with video component, added video and want to go back

					if (
						!textValue &&
						!postData?.description &&
						!postData?.video &&
						!video &&
						!arrImages[0]?.imageLink &&
						!postData?.image
					) {
						return;
					}

					// post with video without text
					if (!textValue && !postData?.description && video === postData?.video) {
						return;
					}

					// post with image without text
					if (arrImages[0]?.imageLink && postData?.image)
						if (
							!textValue &&
							!postData?.description &&
							arrImages[0]?.imageLink === postData?.image[0]
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
								},
							},
						]
					);
				}
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			navigation,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			arrImages[0]?.imageLink,
			video,
			saving,
			dispatch,
			singlePost?.postBody,
			textValue,
		]
	);

	useEffect(() => {
		if (postId) {
			dispatch(getSinglePostByIdAsync(postId));
		}
	}, [dispatch, postId]);

	const [fileType, setFileType] = useState('');

	useEffect(() => {
		setFileType(
			(arrImages && arrImages.length > 0 && 'image') ||
				(video && 'video') ||
				(singlePost?.postBody && parseStringToJSONdata(singlePost?.postBody)?.fileType)
		);
	}, [arrImages, video, singlePost?.postBody]);

	useEffect(() => {
		if (imagePickerResponse) {
			if (imagePickerResponse?.length > 0 && imageFormat) {
				console.log('imagesGallery >>>>', imagePickerResponse);
				const imagesGallery = imagePickerResponse?.map(({type, fileName, uri}) => ({
					type: Platform.OS === 'ios' ? type : imageFormat,
					fileName: fileName,
					uri: Platform.OS === 'ios' ? uri?.replace('file://', '') : uri,
				}));
				dispatch(
					createFilesUploadsAsync(imagesGallery, authUser.data?.email, AbortUploadingController)
				);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, imagePickerResponse, imageFormat]);

	useEffect(() => {
		if (postId && singlePost?.postBody) {
			const postBody = parseStringToJSONdata(singlePost?.postBody);

			postBody?.description && setTextValue(postBody?.description);
			postBody?.video && setVideo(postBody?.video);
			postBody?.image && setArrImages(postBody?.image.map((imageLink: string) => ({imageLink})));
			postBody?.mediaParams && setMediaParams(postBody?.mediaParams);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [singlePost?.postBody]);

	useEffect(() => {
		if (fileUploads?.multiImageUrl && fileUploads?.multiImageUrl.length > 0) {
			const isVideo = ['.mp4', '.webm', '.mov', '.m4v', '.avi'].some(endings =>
				fileUploads?.multiImageUrl[0]?.toLowerCase().endsWith(endings)
			);
			if (isVideo) {
				setVideo(fileUploads.multiImageUrl[0]);
				return;
			} else {
				const preparedArray = fileUploads.multiImageUrl.map((imageLink: string) => ({
					imageLink,
				}));

				setVideo('');
				addNewImage(preparedArray);
			}
		}
	}, [fileUploads?.multiImageUrl]);

	const onPressHandler = async (dataType: string) => {
		if (textValue.length > 0 || arrImages.length > 0 || video) {
			await setSaving(true);

			if (postId) {
				const postBody = parseStringToJSONdata(singlePost?.postBody);

				const updateObj = {
					bodyType: postBody.bodyType,
					fileType: dataType ? dataType : 'text',
					description: textValue,
					image: arrImages.map(({imageLink}) => imageLink),
					video: video,
					mediaParams,
				};
				dispatch(updatePostByIdAsync({postId, userId: authUser.data?.id, postBody: updateObj}));
			} else {
				let dispatchObj = {
					bodyType: 'text||file',
					fileType: dataType || 'text',
					description: textValue,
					mediaParams,
				};
				if (dataType) {
					// @ts-ignore
					dispatchObj[`${dataType}`] =
						dataType === 'image' ? arrImages.map(({imageLink}) => imageLink) : video;
				}
				dispatch(
					createPostAsync({
						userId: authUser.data?.id,
						treeId,
						postType: type,
						postBody: dispatchObj,
					})
				);
			}
			navigation.goBack();
		}

		dispatch(restoreFileUploads());
		dispatch(cleanNewPostData());
		dispatch(cleanSinglePost());
	};

	const addNewImage = (imagesGallery: [{imageLink: string}] | []) => {
		//recover it for CarouselCards later
		// setArrImages(currState => [...currState, ...imagesGallery]);
		setArrImages(imagesGallery);
	};

	const deletePhoto = () => {
		// setArrImages(currState =>
		//   [...currState].filter((_, index) => indexCard !== index),
		// );
		setArrImages([]);
		dispatch(restoreFileUploads());
	};

	const prepareUploadingMedia = async ({
		options,
		result,
		modifiedImage,
	}: PrepareUploadingMediaPropsType) => {
		// 100mb in kilobytes
		const limitedFileSize = 1e8;
		const androidVideoData = result.uri && (await FileSystem.getInfoAsync(result.uri));
		const fileSize =
			Platform.OS === 'ios'
				? // @ts-ignore
				  result.fileSize
				: options.mediaTypes === 'Videos'
				? // @ts-ignore
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
				? result.uri?.split('/').pop()
				: modifiedImage
				? modifiedImage.split('/').pop()
				: Platform.OS === 'ios'
				? result.path?.split('/').pop()
				: result.uri?.split('/').pop();
		let match = options.mediaTypes === 'Videos' && /\.(\w+)$/?.exec(filename as string);

		let format = options.mediaTypes === 'Videos' && match ? `${type}/${match[1]}` : type;

		setImageFormat(options.mediaTypes === 'Videos' ? format : result.mime);

		setImagePickerResponse(
			options.mediaTypes === 'Videos'
				? [{fileName: result.uri, uri: result.uri}]
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
							height: result.rotation === 90 ? result.width : result.height,
							width: result.rotation === 90 ? result.height : result.width,
					  }
					: null
				: null
		);
	};

	const handleShowOptions = useCallback(async (option: string, type: string) => {
		const options = {
			mediaTypes:
				type === 'image'
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
				// types problems with lib
				// @ts-ignore
				if (!result.cancelled) {
					// @ts-ignore
					prepareUploadingMedia({options, result});
				}
			} else {
				// @ts-ignore
				!result.cancelled &&
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
				!result.cancelled &&
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
								modifiedImage: Platform.OS === 'ios' ? '' : 'file://' + modifiedImage,
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

	const onOpenActionSheet = (type: string) => {
		// customize view android
		Keyboard.dismiss();
		const userInterfaceStyle = 'light';
		const options = [
			`Take ${type === 'image' ? 'photo' : 'video'}`,
			`Select ${type === 'image' ? 'photo' : 'video'} from library`,
			'Cancel',
		];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			buttonIndex => {
				if (buttonIndex !== cancelButtonIndex) {
					handleShowOptions(options[buttonIndex as number], type);
				}
			}
		);
	};

	const handlerText = (value: string) => {
		setTextValue(value);
	};

	const removeVideoLink = () => setVideo('');

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

	const onPlaybackStatusUpdateHandler = (status: any) => {
		// @ts-ignore
		if (status.didJustFinish) {
			// @ts-ignore
			videoRef?.current?.replayAsync();
			// @ts-ignore
			videoRef?.current?.pauseAsync();
		}
	};

	return (
		<>
			<KeyboardAwareScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<Box flex={1}>
					<TextInput
						style={[
							styles.container,
							((arrImages.length === 0 && arrImages.length) || !!(video && video.length === 0)) &&
								styles.containerWithMargin,
						]}
						placeholder="Start typing your text..."
						onChangeText={handlerText}
						value={textValue}
						ref={inputRef}
						multiline
					/>

					{arrImages && arrImages.length > 0 && fileType === 'image' && (
						<AspectRatio
							w="100%"
							ratio={
								mediaParams ? mediaParams?.width! / mediaParams?.height! : imageWidth / imageHeight
							}
							marginBottom={8}
						>
							<FastImage
								source={{uri: arrImages[0]?.imageLink}}
								resizeMode={FastImage.resizeMode.contain}
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
											<Icon color={'red.300'} as={Ionicons} name="md-close-sharp" size={5} />
										)}
									</TouchableOpacity>
								</Box>
							</FastImage>
						</AspectRatio>
					)}

					{video && fileType === 'video' && (
						<Box>
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
										source={{uri: video}} // Can be a URL or a local file.
										ref={(ref: null) => (videoRef.current = ref)} // Store reference
										// onBuffer={this.onBuffer} // Callback when remote video is buffering
										// onError={this.videoError} // Callback when video cannot be loaded
										style={styles.video}
										volume={1.0}
										muted={false}
										ignoreSilentSwitch="ignore"
										controls
										// resizeMode="cover"
										fullscreenAutorotate
										paused={true}
										onLoad={resizeVideoOnLoad}
									/>
								) : (
									<ExpoVideo
										ref={videoRef}
										style={styles.video}
										source={{
											uri: video,
										}}
										useNativeControls
										// resizeMode="contain"
										onPlaybackStatusUpdate={onPlaybackStatusUpdateHandler}
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
									activeOpacity={0.7}
									style={styles.button}
									onPress={removeVideoLink}
								>
									<Icon as={AntDesign} name="delete" size={6} color={'black'} marginRight={1} />
								</TouchableOpacity>
							</Box>
						</Box>
					)}

					{/* {arrImages && arrImages.length > 0 && (
            <CarouselCards
              images={arrImages}
              componentType={type}
              sectionType={type}
              userId={userId}
              deletePhoto={deletePhoto}
            />
          )} */}
					<CustomButton
						isNotDisabled={arrImages.length > 0 || video}
						isBordered
						fontSize={16}
						textColor={arrImages.length || video ? '#DDDDDD' : 'black'}
						onPress={() => (!arrImages.length > 0 || !video) && onOpenActionSheet('image')}
						icon={
							<Icon
								as={MaterialIcons}
								name="add-photo-alternate"
								size={6}
								color={arrImages.length || video ? '#DDDDDD' : 'black'}
								marginRight={1}
							/>
						}
						title={'Add photo'}
						bgColor="#EFF2F5"
					/>
					<CustomButton
						isNotDisabled={arrImages.length > 0 || video}
						isBordered
						fontSize={16}
						textColor={arrImages.length || video ? '#DDDDDD' : 'black'}
						onPress={() => (!arrImages.length > 0 || !video) && onOpenActionSheet('video')}
						marginTop={16}
						icon={
							<Icon
								as={Feather}
								name="video"
								size={6}
								color={arrImages.length || video ? '#DDDDDD' : 'black'}
								marginRight={2}
							/>
						}
						title={'Add video'}
						bgColor="#EFF2F5"
					/>
				</Box>
			</KeyboardAwareScrollView>
			<Box position="absolute" alignSelf="center" bottom={8}>
				<CustomButton
					isNotDisabled={!arrImages.length && !textValue.length && !video}
					textColor={'white'}
					onPress={() =>
						onPressHandler(
							(arrImages && arrImages.length > 0 && 'image') ||
								(video && 'video') ||
								(textValue && !textValue.length && 'text') ||
								''
						)
					}
					title={postId ? 'Save Changes' : 'Publish'}
					bgColor={arrImages.length || textValue.length || video ? colors.primary : 'grey'}
				/>
			</Box>
		</>
	);
};

export default EditPostScreen;
