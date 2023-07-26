import React, {useCallback, useRef, useState, useEffect, FC} from 'react';

import {Platform, TouchableOpacity, Image, GestureResponderEvent} from 'react-native';

import {VStack, HStack, AspectRatio, Text, Box} from 'native-base';
import FastImage from 'react-native-fast-image';
import ViewMoreText from 'react-native-view-more-text';
import {useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {useIsFocused, useNavigation, useTheme} from '@react-navigation/native';
import {Feather} from '@expo/vector-icons';
import {Icon} from 'native-base';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {AVPlaybackStatus} from 'expo-av';

import {authSelector, getUsedStorageReportByEmailAsync} from '~redux/slices/auth';
import {userSelector} from '~redux/slices/user';
import {cleanSinglePost, deletePostByIdAsync} from '~redux/slices/posts';
import {cleanComments} from '~redux/slices/comments';

import {noGenderAvatarImage} from '~images';
import {CustomizedVideo} from '~shared';
import FamilyMemberName from '~shared/FamilyMembersList/components/FamilyMemberName';
import CommentIcon from '~shared/Icons/CommentIcon';
// import {CarouselCards} from '~shared/CarouselCards/CarouselCards';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';
import {useAppDispatch} from '~hooks/redux';

import styles from './styles';

type SinglePostPropsType = {
	text?: string;
	postDate: number;
	image: string[] | undefined;
	postId?: string;
	treeId?: string;
	postAuthorId: number;
	postAuthorName: string | boolean;
	postAuthorAvatar: string;
	comments: number[] | [];
	video?: string | undefined;
	isVideoPlaying: boolean;
	setIsVideoPlaying: (isPlaying: boolean) => void;
	currentVideo: string | null;
	setCurrentVideo: (currentVideo: string) => void;
	setVideoStatus?: (status: AVPlaybackStatus) => void;
	fileType: 'image' | 'video' | 'text';
	myPosts: boolean;
	mediaParams?: {
		width: number;
		height: number;
	};
};

const SinglePost: FC<SinglePostPropsType> = ({
	text = '',
	postDate,
	image,
	postId,
	treeId,
	postAuthorId,
	postAuthorName,
	postAuthorAvatar,
	comments,
	video,
	isVideoPlaying,
	setIsVideoPlaying,
	currentVideo,
	setCurrentVideo,
	fileType,
	myPosts,
	mediaParams,
}) => {
	// TODO change any for type of video
	const videoRef = useRef<any>();
	const user = useSelector(userSelector.getUser);
	const {colors} = useTheme();
	const navigation = useNavigation<StackNavigationPropsWithParams<RouteStackList.CommentsScreen>>();
	const focused = useIsFocused();
	const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus>();
	const authUser = useSelector(authSelector.getAuthUser);

	const [imageWidth, setImageWidth] = useState(1);
	const [imageHeight, setImageHeight] = useState(1);

	const userData = user?.data;

	const dispatch = useAppDispatch();

	const date = dayjs(postDate).format('MM-DD-YYYY').toString();

	useEffect(() => {
		if (Platform.OS === 'ios') {
			if (!focused && videoRef?.current) {
				videoRef?.current?.setNativeProps({paused: true});
			}
		} else {
			// @ts-ignore
			if (!focused && videoStatus?.isPlaying && videoRef?.current) {
				videoRef?.current?.setStatusAsync({
					shouldPlay: false,
				});
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [focused]);

	const handleShowOptions = useCallback(
		(type: string) => {
			if (+authUser.data?.id === +postAuthorId) {
				if (type === 'Update') {
					navigation.navigate(RouteStackList.EditPostScreen, {
						type: 'post',
						userId: postAuthorId.toString(),
						postId,
						treeId, // TODO: check for what we need treeId
						title: 'Edit Moment',
					});
				} else {
					dispatch(deletePostByIdAsync(postId));
					dispatch(getUsedStorageReportByEmailAsync(authUser.data.email));
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[authUser.data?.id, postAuthorId, postId]
	);

	const {showActionSheetWithOptions} = useActionSheet();

	const onOpenActionSheet = (): void => {
		// customize view android
		dispatch(cleanSinglePost());
		const userInterfaceStyle = 'light';
		const options = ['Update', 'Delete', 'Cancel'];
		const cancelButtonIndex = options.length - 1;
		const destructiveButtonIndex = options.length - 2;

		showActionSheetWithOptions(
			{
				options,
				destructiveButtonIndex,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			(buttonIndex: number | undefined) => {
				if (buttonIndex !== cancelButtonIndex) {
					handleShowOptions(options[buttonIndex as number]);
				}
			}
		);
	};

	const renderViewMore = (onPress: ((event: GestureResponderEvent) => void) | undefined) => {
		return (
			<Text fontFamily="Roboto-Regular" textAlign="center" fontSize={14} onPress={onPress}>
				Show more
			</Text>
		);
	};
	const renderViewLess = (onPress: ((event: GestureResponderEvent) => void) | undefined) => {
		return (
			<Text fontFamily="Roboto-Regular" textAlign="center" fontSize={14} onPress={onPress}>
				Show less
			</Text>
		);
	};

	const onImageLayout = (): void => {
		if (image && image.length > 0) {
			Image.getSize(
				image[0],
				(width1, height1) => {
					!mediaParams && setImageWidth(width1);
					!mediaParams && setImageHeight(height1);
				},
				error => {
					console.error('ScaledImage,Image.getSize failed with error: ', error);
				}
			);
		}
	};

	const onPress = (): void => {
		dispatch(cleanComments());
		navigation.navigate(RouteStackList.CommentsScreen, {
			postId,
			comments,
			postAuthorId,
		});
	};

	return (
		<VStack borderBottomColor="#EFF2F5" borderBottomWidth={1} position="relative">
			{+authUser.data?.id === +postAuthorId && (
				<TouchableOpacity activeOpacity={1} style={styles.more} onPress={onOpenActionSheet}>
					<Icon as={Feather} name="more-vertical" size={30} color={'black'} />
				</TouchableOpacity>
			)}

			<HStack justifyContent="center" alignItems="center" alignSelf="flex-start" paddingY={4}>
				<FastImage
					source={
						postAuthorAvatar || (myPosts && user?.data?.userPictureLink)
							? {
									uri: postAuthorAvatar || (myPosts && user?.data?.userPictureLink),
							  }
							: noGenderAvatarImage
					}
					resizeMode={FastImage.resizeMode.cover}
					style={styles.image}
				/>
				<VStack alignItems="flex-start" textAlign="left" maxWidth="65%">
					<Box>
						<FamilyMemberName
							name={
								(postAuthorName ||
									(userData?.firstName || '') +
										(userData?.maidenName ? `(${userData?.maidenName})` : '') +
										(userData?.lastName ? ` ${userData?.lastName}` : '')) as string
							}
							style={styles.username}
						/>
						{/* <FamilyMemberDescription
            familyRole={familyRole}
            generation={generation}
          /> */}
					</Box>
				</VStack>
			</HStack>
			{text && (
				<ViewMoreText
					numberOfLines={3}
					renderViewMore={renderViewMore as ((handlePress: () => void) => JSX.Element) | undefined}
					renderViewLess={renderViewLess as ((handlePress: () => void) => JSX.Element) | undefined}
					textStyle={styles.viewMoreText}
				>
					<Text
						fontFamily="Roboto-Regular"
						paddingX={3}
						fontWeight={400}
						fontSize={16}
						lineHeight={26}
					>
						{text}
					</Text>
				</ViewMoreText>
			)}

			{
				image && image.length > 0 && fileType === 'image' && (
					// (image.length > 1 ? (
					//   <CarouselCards images={image.map(link => ({imageLink: link}))} />
					// ) :
					<AspectRatio
						w="100%"
						ratio={
							mediaParams ? mediaParams?.width / mediaParams?.height : imageWidth / imageHeight
						}
					>
						<FastImage
							source={{uri: image[0]}}
							resizeMode={FastImage.resizeMode.contain}
							onLayout={onImageLayout}
						/>
					</AspectRatio>
				)
				// )
			}

			{video && fileType === 'video' && (
				<CustomizedVideo
					ref={videoRef}
					videoUri={video}
					ratio={mediaParams && mediaParams?.width / mediaParams?.height}
					// setVideoWidth={setVideoWidth}
					// setVideoHeight={setVideoHeight}
					isPlaying={isVideoPlaying}
					// @ts-ignore
					setIsPlaying={setIsVideoPlaying}
					// @ts-ignore
					currentVideo={currentVideo}
					// @ts-ignore
					setCurrentVideo={setCurrentVideo}
					// @ts-ignore
					setVideoStatus={setVideoStatus}
				/>
			)}
			<HStack
				width="100%"
				justifyContent="space-between"
				alignItems="center"
				paddingX={3}
				marginY={4}
				alignSelf="flex-start"
			>
				<HStack>
					<TouchableOpacity onPress={onPress}>
						<HStack>
							<Box style={styles.commentIcon}>
								<CommentIcon />
							</Box>

							<Text
								fontFamily="Roboto-Regular"
								fontStyle="normal"
								color={colors.text}
								fontWeight={400}
								lineHeight={26}
								fontSize={16}
							>
								{comments ? comments.length : 0}
							</Text>
						</HStack>
					</TouchableOpacity>
				</HStack>
				<Box>
					<Text
						fontFamily="Roboto-Regular"
						color="#ACB4BE"
						fontWeight={400}
						lineHeight={14}
						fontSize={14}
					>
						{date}
					</Text>
				</Box>
			</HStack>
		</VStack>
	);
};

export default SinglePost;
