import React, {useCallback, FC} from 'react';

import {GestureResponderEvent, StyleSheet, TouchableOpacity} from 'react-native';
import {VStack, HStack, Text} from 'native-base';
import FastImage from 'react-native-fast-image';
import ViewMoreText from 'react-native-view-more-text';
import {useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {useNavigation} from '@react-navigation/native';
import {scale} from 'react-native-utils-scale';
import {Feather} from '@expo/vector-icons';
import {Icon} from 'native-base';
import {useActionSheet} from '@expo/react-native-action-sheet';

import {noGenderAvatarImage} from '~images';
import {userSelector} from '~redux/slices/user';
import {postsSelector} from '~redux/slices/posts';
import FamilyMemberName from '~shared/FamilyMembersList/components/FamilyMemberName';
import {deleteCommentByIdAsync} from '~redux/slices/comments';
import {authSelector} from '~redux/slices/auth';

import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';
import {useAppDispatch} from '~hooks/redux';

type SingleCommentPropsType = {
	postId: string;
	postAuthorId: string;
	commentId: string;
	commentText: string;
	commentAuthorAvatar: string;
	commentCreateDate: number;
	commentAuthorBirthDate: string;
	commentAuthorName: string;
	commentAuthorId?: string;
};

const styles = StyleSheet.create({
	image: {
		minHeight: scale(48),
		minWidth: scale(48),
		borderRadius: 100,
		marginRight: scale(16),
	},
	username: {
		fontSize: 20,
		lineHeight: 23,
	},
	more: {
		position: 'absolute',
		zIndex: 1000,
		top: 0,
		right: 0,
		paddingRight: 8,
		paddingTop: 4,
		width: scale(50),
		height: scale(50),
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: 'white',
		shadowOffset: {width: -15, height: 5},
		shadowOpacity: 0.93,
		shadowRadius: 4.5,
	},
});

const SingleComment: FC<SingleCommentPropsType> = ({
	postId,
	postAuthorId,
	commentId,
	commentText,
	commentAuthorAvatar,
	commentCreateDate,
	commentAuthorBirthDate,
	commentAuthorName,
}) => {
	const date = dayjs(commentCreateDate).format('MM-DD-YYYY').toString();
	const age = dayjs(dayjs()).diff(commentAuthorBirthDate, 'year');

	const authUser = useSelector(authSelector.getAuthUser);
	const singlePost = useSelector(postsSelector.getSinglePost);

	const dispatch = useAppDispatch();
	const navigation =
		useNavigation<StackNavigationPropsWithParams<RouteStackList.EditCommentScreen>>();

	const loginedUserId = authUser?.data?.id;

	const handleShowOptions = useCallback(
		async (type: string) => {
			if (+loginedUserId === +postAuthorId) {
				if (type === 'Update') {
					navigation.navigate(RouteStackList.EditCommentScreen, {
						type: 'comment',
						userId: postAuthorId,
						commentId: commentId,
					});
				} else {
					const updatedPostBody = singlePost?.postBody;
					// filtered array without  deleted comment id
					const commentsIdThatShouldDelete = singlePost?.comments?.filter(
						(id: number) => id !== +commentId
					);
					await dispatch(
						deleteCommentByIdAsync({
							commentId,
							postId,
							postAuthorId,
							updatedPostBody,
							commentsIdThatShouldDelete,
						})
					);
				}
			}
		},
		[
			commentId,
			dispatch,
			loginedUserId,
			navigation,
			postAuthorId,
			postId,
			singlePost?.comments,
			singlePost?.postBody,
		]
	);

	const {showActionSheetWithOptions} = useActionSheet();

	const onOpenActionSheet = () => {
		// customize view android
		const userInterfaceStyle = 'light';
		const options = ['Update', 'Delete', 'Cancel'];
		const cancelButtonIndex = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			buttonIndex => {
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

	return (
		<VStack borderBottomColor="#EFF2F5" borderBottomWidth={1} position="relative">
			{+loginedUserId === +postAuthorId && (
				<TouchableOpacity style={styles.more} onPress={onOpenActionSheet}>
					<Icon as={Feather} name="more-vertical" size={30} color={'black'} />
				</TouchableOpacity>
			)}
			<HStack
				justifyContent="center"
				alignItems="center"
				alignSelf="flex-start"
				paddingX={3}
				paddingY={4}
			>
				<FastImage
					source={commentAuthorAvatar ? {uri: commentAuthorAvatar} : noGenderAvatarImage}
					resizeMode={FastImage.resizeMode.cover}
					style={styles.image}
				/>
				<VStack alignItems="flex-start" textAlign="left" maxWidth="65%">
					<FamilyMemberName name={commentAuthorName} age={age || 0} style={styles.username} />
					{/* <FamilyMemberDescription
            familyRole={familyRole}
            generation={generation}
          /> */}
				</VStack>
			</HStack>
			{commentText && (
				<ViewMoreText
					numberOfLines={3}
					renderViewMore={renderViewMore}
					renderViewLess={renderViewLess}
					textStyle={{paddingHorizontal: scale(8), marginBottom: scale(4)}}
				>
					<Text
						fontFamily="Roboto-Regular"
						paddingX={3}
						fontWeight={400}
						fontSize={16}
						lineHeight={26}
					>
						{commentText}
					</Text>
				</ViewMoreText>
			)}
			<HStack
				width="100%"
				justifyContent="space-between"
				alignItems="center"
				paddingX={3}
				paddingY={4}
				alignSelf="flex-start"
			>
				<HStack>
					<Text
						fontFamily="Roboto-Regular"
						color="#ACB4BE"
						fontWeight={400}
						lineHeight={14}
						fontSize={14}
					>
						Reply
					</Text>
				</HStack>
				<HStack>
					<Text
						fontFamily="Roboto-Regular"
						color="#ACB4BE"
						fontWeight={400}
						lineHeight={14}
						fontSize={14}
					>
						{date}
					</Text>
				</HStack>
			</HStack>
		</VStack>
	);
};

export {SingleComment};
