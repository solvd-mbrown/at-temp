import React, {FC} from 'react';

import {TouchableOpacity, TouchableHighlight, Platform} from 'react-native';

import {VStack, Box, CloseIcon, AspectRatio, Icon, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {AntDesign, Ionicons} from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';

import {updateUserById} from '~redux/slices/user';
import {VideoEmptyPoster} from '~images';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';

import styles from './styles';

type IntroductionListItemType = {
	type: 'images' | 'video' | 'text';
	images?: Array<{[key: string]: string}>;
	video?: string | undefined;
	poster?: string | undefined;
	mediaParams?:
		| undefined
		| {
				width: number;
				height: number;
		  };
	text?: string | undefined;
	description?: string | undefined;
	elementIndex: number;
	userId: number;
	sectionType: string;
	videoPoster?: string;
	parsedIntroduction: {
		[key: string]: IntroductionListItemType[];
	};
};

const IntroductionListItem: FC<IntroductionListItemType> = ({
	type,
	images,
	video,
	poster,
	mediaParams,
	text,
	description,
	elementIndex,
	userId,
	parsedIntroduction,
	sectionType,
}) => {
	const dispatch = useDispatch();
	// const [imageWidth, setImageWidth] = useState(1);
	// const [imageHeight, setImageHeight] = useState(1);

	const navigation =
		useNavigation<StackNavigationPropsWithParams<RouteStackList.EditProfileIntroductionScreen>>();

	const handleDelete = () => {
		const elementsWithoutSelected = parsedIntroduction[sectionType];
		elementsWithoutSelected.splice(elementIndex, 1);
		parsedIntroduction[sectionType] = elementsWithoutSelected;
		dispatch(
			updateUserById({
				userId,
				userData: {
					introduction: parsedIntroduction,
				},
			})
		);
	};

	const onPressHandler = () =>
		navigation.navigate(RouteStackList.EditProfileIntroductionScreen, {
			type,
			text,
			images,
			video,
			poster,
			description,
			mediaParameters: mediaParams,
			editable: true,
			elementIndex,
			parsedIntroduction,
			sectionType,
			userId,
		});

	return (
		<TouchableOpacity onPress={onPressHandler}>
			<VStack
				paddingY={12}
				paddingX={5}
				marginTop={10}
				borderWidth={1}
				borderColor={'#DDDDDD'}
				borderRadius={5}
				position="relative"
			>
				<Box position="absolute" top={-10} right={0}>
					<TouchableHighlight
						underlayColor={'#DDDDD'}
						activeOpacity={0.7}
						style={styles.button}
						onPress={handleDelete}
					>
						{Platform.OS === 'ios' ? (
							<CloseIcon />
						) : (
							<Icon color={'red.300'} as={Ionicons} name="md-close-sharp" size={5} />
						)}
					</TouchableHighlight>
				</Box>

				{type === 'video' && (
					<Box>
						<AspectRatio w="100%" ratio={16 / 10}>
							<FastImage
								source={poster ? {uri: poster} : VideoEmptyPoster}
								resizeMode={FastImage.resizeMode.contain}
								// style={styles.image}
								// onLayout={() => {
								// 	Image.getSize(
								// 		poster,
								// 		(width1, height1) => {
								// 			!mediaParams && setImageWidth(width1);
								// 			!mediaParams && setImageHeight(height1);
								// 		},
								// 		error => {
								// 			console.error('ScaledImage,Image.getSize failed with error: ', error);
								// 		}
								// 	);
								// }}
							>
								<Icon
									alignSelf={'center'}
									marginY={'auto'}
									as={AntDesign}
									name="play"
									size={16}
									color={'white'}
								/>
							</FastImage>
						</AspectRatio>
					</Box>
				)}

				{type === 'images' && images && (
					// <CarouselCards images={images} editable={false} />
					<AspectRatio w="100%" ratio={16 / 10}>
						<FastImage
							source={{uri: images[0]?.imageLink}}
							resizeMode={FastImage.resizeMode.contain}
							// onLayout={() => {
							// 	Image.getSize(
							// 		images[0].imageLink,
							// 		(width1, height1) => {
							// 			!mediaParams && setImageWidth(width1);
							// 			!mediaParams && setImageHeight(height1);
							// 		},
							// 		error => {
							// 			console.error('ScaledImage,Image.getSize failed with error: ', error);
							// 		}
							// 	);
							// }}
						/>
					</AspectRatio>
				)}
				{description && (
					<Box marginTop={3}>
						<Text fontFamily="Roboto-Regular">{description}</Text>
					</Box>
				)}
				{type === 'text' && <Text fontFamily="Roboto-Regular">{text}</Text>}
			</VStack>
		</TouchableOpacity>
	);
};

export {IntroductionListItem};
