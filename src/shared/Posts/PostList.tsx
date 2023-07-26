import React, {useEffect, useCallback, useState, FC} from 'react';

import {ListRenderItem, TouchableOpacity} from 'react-native';
import {FlatList} from 'native-base';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Icon} from 'native-base';
import {useActionSheet} from '@expo/react-native-action-sheet';

import {cleanSinglePost, getUserPostsByUserIdAsync, postsSelector} from '~redux/slices/posts';
import {userSelector} from '~redux/slices/user';
import {restoreFileUploads} from '~redux/slices/fileUploads';
import {authSelector} from '~redux/slices/auth';
import {EntityWithProps} from '~interfaces/IEntityWithProps';
import {UserProperties} from '~types/UserProperties';

import SinglePost from './components/SinglePost';
import {PostProperties} from '~types/PostProperties';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';
import styles from './styles';
import {useAppDispatch} from '~hooks/redux';
import {parseStringToJSONdata} from '~utils';

type PostData = {
	postBody: string;
	id?: string;
	comments: number[] | [];
	Post: EntityWithProps<PostProperties>;
	User: EntityWithProps<UserProperties>;
};

type PostListPropsType = {
	editable?: boolean;
	myPosts?: boolean;
	treeId?: string;
	postsData?: PostData[];
};

const PostList: FC<PostListPropsType> = ({postsData, treeId, editable, myPosts = false}) => {
	const dispatch = useAppDispatch();
	const navigation = useNavigation<StackNavigationPropsWithParams<RouteStackList.EditPostScreen>>();

	const posts = useSelector(postsSelector.getPosts);
	const recentlyDeletedPostId = useSelector(postsSelector.getRecentlyDeletedPostId);
	const newPostsData = useSelector(postsSelector.getNewPostsData);
	const user = useSelector(userSelector.getUser);
	const authUser = useSelector(authSelector.getAuthUser);

	const handleShowOptions = useCallback(
		(type: string) => {
			const options = type === 'Moment' && {type: 'post'};

			navigation.navigate(RouteStackList.EditPostScreen, {
				...options,
				userId: authUser.data?.id,
				treeId,
			});
		},
		[navigation, authUser.data?.id, treeId]
	);

	const {showActionSheetWithOptions} = useActionSheet();

	const onOpenActionSheet = (): void => {
		// customize view android
		dispatch(cleanSinglePost());
		dispatch(restoreFileUploads());

		const userInterfaceStyle = 'light';
		const options = ['Moment', 'Cancel'];
		const cancelButtonIndex = options.length - 1;

		dispatch(restoreFileUploads());
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

	useEffect(() => {
		recentlyDeletedPostId && dispatch(getUserPostsByUserIdAsync(user?.data?.id));
		dispatch(restoreFileUploads());
	}, [dispatch, user?.data?.id, recentlyDeletedPostId, newPostsData]);

	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [currentVideo, setCurrentVideo] = useState<string | null>(null);

	const renderItem: ListRenderItem<PostData> = ({item}) => {
		const parsedBody = parseStringToJSONdata(
			!myPosts && item?.Post ? item?.Post?.properties?.postBody : item?.postBody
		);
		const image = parsedBody?.image;
		const video = parsedBody?.video;
		const text = parsedBody?.description;
		const fileType = parsedBody?.fileType;
		const mediaParams = parsedBody?.mediaParams;

		return (
			<SinglePost
				key={item.id}
				postAuthorId={!myPosts ? item?.Post?.properties?.publishedById : user?.data?.id}
				postAuthorName={
					!myPosts &&
					(item?.User?.properties?.firstName || '') +
						(item?.User?.properties?.maidenName ? ` (${item?.User?.properties?.maidenName})` : '') +
						(item?.User?.properties?.lastName ? ` ${item?.User?.properties?.lastName}` : '')
				}
				postAuthorAvatar={!myPosts ? item?.User?.properties?.userPictureLink : ''}
				postId={!myPosts ? item?.Post?.identity : item.id}
				treeId={treeId}
				text={text}
				image={image}
				video={video}
				isVideoPlaying={isVideoPlaying}
				setIsVideoPlaying={setIsVideoPlaying}
				currentVideo={currentVideo}
				setCurrentVideo={setCurrentVideo}
				fileType={fileType}
				mediaParams={mediaParams}
				comments={!myPosts ? item?.Post?.properties?.comments : item?.comments}
				postDate={item?.Post?.properties?.createDate}
				myPosts={myPosts}
			/>
		);
	};

	return (
		<>
			<FlatList
				paddingY={2}
				marginBottom={2}
				showsVerticalScrollIndicator={false}
				data={myPosts ? posts : postsData}
				keyExtractor={(item: PostData) => (!myPosts ? item?.Post?.identity : item?.id) as string}
				renderItem={renderItem}
			/>
			{editable && (
				<TouchableOpacity style={styles.add} onPress={onOpenActionSheet}>
					<Icon as={Ionicons} name="add-circle-outline" size={27} color="white" />
				</TouchableOpacity>
			)}
		</>
	);
};

export {PostList};
