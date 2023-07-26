import React, {useState, useEffect, useCallback} from 'react';

import {View, StyleSheet, Platform} from 'react-native';

import {useNavigation, useTheme} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import {useDispatch, useSelector} from 'react-redux';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {scale} from 'react-native-utils-scale';
import {useActionSheet} from '@expo/react-native-action-sheet';

import {createFilesUploadsAsync, fileUploadsSelector} from '~redux/slices/fileUploads';
import {authSelector} from '~redux/slices/auth';

import {useOverlaySpinner} from '~hooks';

import {CustomButton} from '~shared';

import CarouselCardItem from './CarouselCardItem';

const styles = StyleSheet.create({
	swiper: {
		height: scale(224),
	},
	swiperPagination: {
		top: scale(224),
	},
	dot: {
		backgroundColor: '#EFF2F5',
		width: scale(8),
		height: scale(8),
		marginLeft: scale(8),
		marginRight: scale(8),
		shadowOffset: {
			width: 0,
			height: scale(3),
		},
		shadowOpacity: 0.29,
		shadowRadius: 4.65,
	},
	activeDot: {
		backgroundColor: '#E8AD63',
		width: scale(8),
		height: scale(8),
		marginLeft: scale(8),
		marginRight: scale(8),
		shadowOffset: {
			width: 0,
			height: scale(3),
		},
		shadowOpacity: 0.29,
		shadowRadius: 4.65,
	},
});

const CarouselCards = ({
	images,
	editable,
	elementIndex,
	parsedIntroduction,
	sectionType,
	userId,
	componentType,
	deletePhoto,
}) => {
	const navigation = useNavigation();
	const {colors} = useTheme();
	const {auth} = useSelector(authSelector);

	const [arrayImages, setArrayImages] = useState([]);
	const [imagePickerResponse, setImagePickerResponse] = useState(null);

	const {showActionSheetWithOptions} = useActionSheet();

	const dispatch = useDispatch();

	const {fileUploads, uploading} = useSelector(fileUploadsSelector);

	const isOverlaySpinnerVisibleDuringUserLoading = useOverlaySpinner(uploading);

	useEffect(() => {
		if (images) {
			setArrayImages(images);
			return;
		}
		setArrayImages([]);
	}, [images]);

	useEffect(() => {
		if (imagePickerResponse?.assets) {
			if (imagePickerResponse?.assets.length > 0) {
				const imagesGallery = imagePickerResponse.assets.map(({type, fileName, uri}) => ({
					type,
					fileName,
					uri: Platform.OS === 'ios' ? uri?.replace('file://', '') : uri,
				}));

				dispatch(createFilesUploadsAsync(imagesGallery, auth.data.email));
			}
		}
	}, [dispatch, imagePickerResponse]);

	useEffect(() => {
		if (fileUploads?.data?.multiImageUrl?.payload && sectionType !== 'post') {
			const preparedArray = fileUploads.data.multiImageUrl.payload.map(imageLink => ({
				imageLink,
			}));
			addNewImage(preparedArray);
		}
	}, [fileUploads?.data?.multiImageUrl?.payload, sectionType]);

	const deleteCard = indexCard => {
		if (sectionType === 'post') {
			deletePhoto(indexCard);
		} else {
			setArrayImages(currState => [...currState].filter((_, index) => indexCard !== index));
		}
	};

	const addNewImage = imagesGallery => {
		setArrayImages(currState => [...currState, ...imagesGallery]);
	};

	const dispatchHandler = () => {
		if (parsedIntroduction && arrayImages.length > 0) {
			const dispatchData = JSON.parse(JSON.stringify(parsedIntroduction));
			if (!elementIndex && elementIndex !== 0) {
				dispatchData[sectionType].push({
					type: componentType,
					images: arrayImages,
				});
			} else {
				dispatchData[sectionType][elementIndex].images = arrayImages;
			}

			dispatch(
				updateUserById({
					userId,
					userData: {
						introduction: dispatchData,
					},
				})
			);

			navigation.navigate('EditIntroductionListScreen', {
				userId,
				sectionType,
			});
		}
	};

	const handleShowImagePicker = useCallback(type => {
		if (type === 'Take photo') {
			const options = {
				saveToPhotos: true,
				mediaType: 'photo',
				includeBase64: false,
			};

			launchCamera(options, setImagePickerResponse);
		} else {
			const options = {
				selectionLimit: 10,
				mediaType: 'photo',
				includeBase64: false,
			};

			launchImageLibrary(options, setImagePickerResponse);
		}
	}, []);

	const onOpenActionSheet = index => {
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
					handleShowImagePicker(options[buttonIndex], index);
				}
			}
		);
	};

	return (
		<View>
			<Swiper
				style={styles.swiper}
				dot={<View style={styles.dot} />}
				activeDot={<View style={styles.activeDot} />}
				paginationStyle={styles.swiperPagination}
				loop={false}
				key={arrayImages.length}
			>
				{(editable || arrayImages.length === 0
					? [...arrayImages, {imageLink: ''}]
					: arrayImages
				).map(({imageLink}, index) => (
					<CarouselCardItem
						image={imageLink}
						editable={editable}
						sectionType={sectionType}
						totalImages={arrayImages.length}
						index={index}
						key={imageLink + index}
						deleteCard={deleteCard}
						addCard={addNewImage}
						onOpenActionSheet={onOpenActionSheet}
					/>
				))}
			</Swiper>
			{editable && (
				<CustomButton
					onPress={() => dispatchHandler()}
					marginTop={scale(24)}
					isNotDisabled={!isOverlaySpinnerVisibleDuringUserLoading && !arrayImages.length}
					title="Save changes"
					isBordered
					textColor={
						isOverlaySpinnerVisibleDuringUserLoading || arrayImages.length
							? colors.primary
							: '#DDDDDD'
					}
				/>
			)}
		</View>
	);
};

export {CarouselCards};
