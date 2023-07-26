import React, {useEffect, FC} from 'react';

import {useSelector} from 'react-redux';

import {commentsSelector, getCommentsByPostIdAsync} from '~redux/slices/comments';
import {getSinglePostByIdAsync} from '~redux/slices/posts';
import {CommentsList} from '~shared/Comments/CommentsList';

import {EntityWithProps} from '~interfaces/IEntityWithProps';
import {CommentProperties} from '~types/CommentProperties';

import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';
import {IUser} from '~interfaces/IUser';
import {useAppDispatch} from '~hooks/redux';

type User = {
	User: IUser;
};

type Comment = {
	Comment: EntityWithProps<CommentProperties>;
};

type CommentsScreenProps = StackScreenPropsWithParams<RouteStackList.CommentsScreen>;

const CommentsScreen: FC<CommentsScreenProps> = ({route}) => {
	const {postId} = route.params;

	const dispatch = useAppDispatch();
	const comments = useSelector(commentsSelector.getComments);
	const newCommentData = useSelector(commentsSelector.getNewCommentData);
	const recentlyDeletedCommentId = useSelector(commentsSelector.getRecentlyDeletedCommentId);

	useEffect(() => {
		if (postId) {
			dispatch(getCommentsByPostIdAsync(postId));
			dispatch(getSinglePostByIdAsync(postId));
		}
	}, [dispatch, postId, newCommentData, recentlyDeletedCommentId]);

	return (
		<>
			<CommentsList
				comments={
					comments?.length > 0 &&
					comments
						?.filter(({User}: User) => User)
						.sort(
							(a: Comment, b: Comment) =>
								a?.Comment?.properties?.createDate - b?.Comment?.properties?.createDate
						)
				}
				postId={postId}
			/>
		</>
	);
};

export default CommentsScreen;
