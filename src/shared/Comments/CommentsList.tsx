import React, {useState, useEffect, FC} from 'react';

import {Icon} from 'native-base';
import {
	FlatList,
	TextInput,
	TouchableOpacity,
	Keyboard,
	Platform,
	View,
	ViewProps,
	EmitterSubscription,
} from 'react-native';
import {useSelector} from 'react-redux';
import {AntDesign} from '@expo/vector-icons';
import Reanimated, {AnimateProps, useAnimatedStyle} from 'react-native-reanimated';

import {SingleComment} from './SingleComment';

import {createCommentAsync} from '~redux/slices/comments';
import {authSelector} from '~redux/slices/auth';

import {useTransition} from './keyboardHook';
import {EntityWithProps} from '~interfaces/IEntityWithProps';
import {CommentProperties} from '~types/CommentProperties';
import {UserProperties} from '~types/UserProperties';
import {keyboardStyles, styles} from './styles';
import {useAppDispatch} from '~hooks/redux';

type CommentsListPropsType = {
	comments: [
		{
			Comment: EntityWithProps<CommentProperties>;
			User: EntityWithProps<UserProperties>;
		}
	];
	postId?: string;
};

type CreateCommentToPostPropsType = {
	userId: string;
	postId: string | undefined;
	commentType: string;
	commentBodyType: string;
	commentBody: {text: string};
};

const CommentsList: FC<CommentsListPropsType> = ({comments, postId}) => {
	const [textValue, setTextValue] = useState('');
	const [keyboardHeight, setKeyboardHeight] = useState(0);

	useEffect(() => {
		let showSubscription: EmitterSubscription;
		let hideSubscription: EmitterSubscription;
		let showSubscriptionAndroid: EmitterSubscription;
		let hideSubscriptionAndroid: EmitterSubscription;

		if (Platform.OS === 'ios') {
			showSubscription = Keyboard.addListener('keyboardWillShow', e => {
				setKeyboardHeight(e?.endCoordinates?.height);
			});
			hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
				setKeyboardHeight(0);
			});
		}
		if (Platform.OS !== 'ios') {
			showSubscriptionAndroid = Keyboard.addListener('keyboardDidShow', e => {
				setKeyboardHeight(e?.endCoordinates?.height);
			});
			hideSubscriptionAndroid = Keyboard.addListener('keyboardDidHide', () => {
				setKeyboardHeight(0);
			});
		}
		return () => {
			if (Platform.OS === 'ios') {
				showSubscription.remove();
				hideSubscription.remove();
			}
			if (Platform.OS !== 'ios') {
				showSubscriptionAndroid.remove();
				hideSubscriptionAndroid.remove();
			}
		};
	}, []);

	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);

	const createCommentToPost = ({
		userId,
		postId,
		commentType,
		commentBodyType,
		commentBody,
	}: CreateCommentToPostPropsType) => {
		//create logic for comment for comment
		if (commentBody.text.length > 0) {
			dispatch(
				createCommentAsync({
					userId,
					entityId: postId,
					entityType: commentType,
					commentType: commentBodyType,
					commentData: commentBody,
				})
			);
			setTextValue('');
		}
	};

	const {height} = useTransition();

	const scrollViewStyle = useAnimatedStyle(
		() => ({
			transform: [{translateY: height.value - keyboardHeight}],
		}),
		[keyboardHeight]
	);
	const textInputStyle = useAnimatedStyle(() => {
		return {
			borderRadius: 6,
			backgroundColor: '#EFF2F5',
			justifyContent: 'space-between',
			alignItems: 'center',
			position: 'absolute',
			alignSelf: 'center',
			paddingLeft: 12,
			padding: 5,
			width: '90%',
			height: 50,
			flexDirection: 'row',
			transform: [{translateY: -10}],
		};
	}, []);
	const fakeView = useAnimatedStyle(
		() => ({
			height: Math.abs(height.value - keyboardHeight),
		}),
		[keyboardHeight]
	);

	const onPressHandler = () => {
		if (textValue.length > 0) {
			createCommentToPost({
				userId: authUser?.data?.id,
				postId,
				commentType: 'Post',
				commentBodyType: 'Text',
				commentBody: {
					text: textValue,
				},
			});
		}
	};

	return (
		<>
			<View style={styles.container}>
				<Reanimated.ScrollView showsVerticalScrollIndicator={false} style={scrollViewStyle}>
					<View>
						<Reanimated.View style={fakeView} />
						<FlatList
							contentContainerStyle={styles.listContainer}
							// paddingTop={10}
							// paddingBottom={80}
							showsVerticalScrollIndicator={false}
							data={comments}
							keyExtractor={item => item.Comment.identity}
							renderItem={({item}) => {
								const parsedCommentBody = JSON.parse(item?.Comment?.properties?.commentBody);

								const postAuthorId = item?.Comment?.properties?.publishedById;
								const postId = item?.Comment?.properties?.commentForEntityId;
								const commentId = item?.Comment?.identity;
								const commentText = parsedCommentBody.text;
								const commentAuthorId = item?.User?.identity;
								const commentAuthorAvatar = item?.User?.properties?.userPictureLink;
								const commentCreateDate = item?.Comment?.properties?.createDate;
								const commentAuthorBirthDate = item?.User?.properties?.birthdate;
								const commentAuthorName =
									(item?.User?.properties?.firstName || '') +
									(item?.User?.properties?.maidenName
										? ` "${item?.User?.properties?.maidenName}"`
										: '') +
									(item?.User?.properties?.lastName ? ` ${item?.User?.properties?.lastName}` : '');

								return (
									<SingleComment
										postId={postId}
										postAuthorId={postAuthorId}
										commentId={commentId}
										commentText={commentText}
										commentAuthorId={commentAuthorId}
										commentAuthorAvatar={commentAuthorAvatar}
										commentCreateDate={commentCreateDate}
										commentAuthorBirthDate={commentAuthorBirthDate}
										commentAuthorName={commentAuthorName}
									/>
								);
							}}
						/>
					</View>
				</Reanimated.ScrollView>
				<Reanimated.View
					// any for reanimated lib styles
					style={
						(Platform.OS === 'ios'
							? keyboardStyles().inputWrapper(keyboardHeight)
							: textInputStyle) as AnimateProps<ViewProps> | Readonly<AnimateProps<ViewProps>> | any
					}
				>
					<TextInput
						// fontFamily="Roboto-Regular"
						style={styles.input}
						placeholder="Leave comment"
						blurOnSubmit={false}
						onChangeText={setTextValue}
						value={textValue}
						multiline
						editable
					/>

					<TouchableOpacity onPress={onPressHandler} style={styles.button}>
						<Icon as={AntDesign} name="arrowup" size={28} color={'white'} />
					</TouchableOpacity>
				</Reanimated.View>
			</View>
		</>
	);
};

export {CommentsList};
