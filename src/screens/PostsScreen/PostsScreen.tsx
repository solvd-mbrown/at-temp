import React, {useEffect} from 'react';

import {useSelector} from 'react-redux';
import {authSelector} from '~redux/slices/auth';

import {commentsSelector} from '~redux/slices/comments';
import {restoreFileUploads} from '~redux/slices/fileUploads';
import {getTreeMembersPostsByTreeIdAsync, postsSelector} from '~redux/slices/posts';

import {PostList} from '~shared';
import {EntityWithProps} from '~interfaces/IEntityWithProps';
import {UserProperties} from '~types/UserProperties';
import {PostProperties} from '~types/PostProperties';
import {useAppDispatch} from '~hooks/redux';

type UserType = {
	User: EntityWithProps<UserProperties>;
};

type PostType = {
	Post: EntityWithProps<PostProperties>;
};

const PostsScreen = () => {
	const dispatch = useAppDispatch();
	const newPostsData = useSelector(postsSelector.getNewPostsData);
	const recentlyDeletedPostId = useSelector(postsSelector.getRecentlyDeletedPostId);
	const treePostsData = useSelector(postsSelector.getTreePostsData);
	const newCommentData = useSelector(commentsSelector.getNewCommentData);
	const recentlyDeletedCommentId = useSelector(commentsSelector.getRecentlyDeletedCommentId);

	const authUser = useSelector(authSelector.getAuthUser);

	useEffect(() => {
		authUser.data?.myTreeIdByParent1 &&
			dispatch(getTreeMembersPostsByTreeIdAsync(authUser.data?.myTreeIdByParent1));
		dispatch(restoreFileUploads());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, newPostsData, recentlyDeletedPostId, newCommentData, recentlyDeletedCommentId]);

	return (
		<PostList
			postsData={
				treePostsData?.length > 0
					? treePostsData
							?.filter(({User}: UserType) => User)
							.sort(
								(a: PostType, b: PostType) =>
									a?.Post?.properties?.createDate - b?.Post?.properties?.createDate
							)
					: []
			}
			treeId={authUser.data?.myTreeIdByParent1}
			editable={true}
		/>
	);
};

export default PostsScreen;
