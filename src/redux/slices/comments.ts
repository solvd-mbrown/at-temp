import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {updatePostByIdAsync} from './posts';
import get from 'lodash/get';

import api from '~api/api';
import {
	CreateCommentAsyncPayload,
	DeleteCommentByIdAsyncPayload,
	UpdateCommentByIdAsyncPayload,
} from '~redux/@types';
import {RootState} from '~redux/store';

const initialState = {
	commentsLoading: false,
	errors: '',
	comments: {
		data: [],
		postComments: [],
		newCommentData: {},
		recentlyDeletedCommentId: null,
		singleComment: {},
	},
};

export const getCommentsByPostIdAsync = createAsyncThunk<any, string>(
	'comments/getCommentsByPostId',
	async postId => {
		const commentsResponse = await api.get(`/comment/all/${postId}/Post`);
		return commentsResponse.data;
	}
);

export const getCommentsByCommentIdAsync = createAsyncThunk<any, string>(
	'comments/getCommentsByCommentId',
	async commentId => {
		const commentsByCommentIdResponse = await api.get(`/post/all/${commentId}`);
		return commentsByCommentIdResponse.data;
	}
);

export const getUserSingleCommentIdAsync = createAsyncThunk<any, string>(
	'comments/getUserSingleCommentId',
	async commentId => {
		const singleCommentResponse = await api.get(`/comment/${commentId}`);
		return singleCommentResponse.data;
	}
);

export const createCommentAsync = createAsyncThunk<any, CreateCommentAsyncPayload>(
	'comments/createComment',
	async ({userId, entityId, entityType, commentType, commentData}) => {
		const commentBody = {
			publishedById: +userId,
			commentForEntityType: entityType, // for example 'Post' || 'Comment'
			commentForEntityId: entityId, // 'PostID' || 'CommentID
			commentType, // for example 'Text' 'FIle'
			commentBody: commentData,
		};

		const commentResponse = await api.post('/comment/add', commentBody);
		return commentResponse.data;
	}
);

export const updateCommentByIdAsync = createAsyncThunk<any, UpdateCommentByIdAsyncPayload>(
	'comments/updateCommentById',
	async ({commentId, userId, entityId, entityType, commentType, commentData}) => {
		const commentBody = {
			publishedById: +userId,
			commentForEntityType: entityType, // for example 'Post' || 'Comment'
			commentForEntityId: entityId,
			commentType, // for example text
			commentBody: JSON.stringify(commentData),
		};

		const updateCommentResponse = await api.patch(`/comment/${commentId}`, commentBody);
		return updateCommentResponse.data;
	}
);

export const deleteCommentByIdAsync = createAsyncThunk<any, DeleteCommentByIdAsyncPayload>(
	'comments/deleteCommentById',
	async (
		{commentId, postId, postAuthorId, updatedPostBody, commentsIdThatShouldDelete},
		{dispatch}
	) => {
		const deleteCommentResponse = await api.delete(`/comment/${commentId}`);
		if (deleteCommentResponse.data.response === 'done') {
			await dispatch(
				updatePostByIdAsync({
					postId,
					userId: postAuthorId,
					postBody: updatedPostBody,
					comments: commentsIdThatShouldDelete,
				})
			);
		}

		return deleteCommentResponse.data;
	}
);

const commentsSlice = createSlice({
	name: 'comments',
	initialState,
	reducers: {
		cleanSingleComment: state => {
			state.comments.singleComment = {};
		},
		cleanComments: state => {
			state.comments.data = [];
		},
		cleanNewPostData: state => {
			state.comments.newCommentData = {};
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getCommentsByPostIdAsync.pending, (state, _) => {
				state.commentsLoading = true;
			})
			.addCase(getCommentsByPostIdAsync.fulfilled, (state, action) => {
				state.commentsLoading = false;
				state.comments.data = action.payload;
			})
			.addCase(getCommentsByPostIdAsync.rejected, (state, action) => {
				state.commentsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(getCommentsByCommentIdAsync.pending, (state, _) => {
				state.commentsLoading = true;
			})
			.addCase(getCommentsByCommentIdAsync.fulfilled, (state, action) => {
				state.commentsLoading = false;
				state.comments.postComments = action.payload;
			})
			.addCase(getCommentsByCommentIdAsync.rejected, (state, action) => {
				state.commentsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(getUserSingleCommentIdAsync.pending, (state, _) => {
				state.commentsLoading = true;
			})
			.addCase(getUserSingleCommentIdAsync.fulfilled, (state, action) => {
				state.commentsLoading = false;
				state.comments.singleComment = action.payload;
			})
			.addCase(getUserSingleCommentIdAsync.rejected, (state, action) => {
				state.commentsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(createCommentAsync.pending, (state, _) => {
				state.commentsLoading = true;
			})
			.addCase(createCommentAsync.fulfilled, (state, action) => {
				state.commentsLoading = false;
				state.comments.newCommentData = action.payload;
			})
			.addCase(createCommentAsync.rejected, (state, action) => {
				state.commentsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(updateCommentByIdAsync.pending, (state, _) => {
				state.commentsLoading = true;
			})
			.addCase(updateCommentByIdAsync.fulfilled, (state, action) => {
				state.commentsLoading = false;
				state.comments.newCommentData = action;
			})
			.addCase(updateCommentByIdAsync.rejected, (state, action) => {
				state.commentsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(deleteCommentByIdAsync.pending, (state, _) => {
				state.commentsLoading = true;
			})
			.addCase(deleteCommentByIdAsync.fulfilled, (state, action) => {
				state.commentsLoading = false;
				state.comments.recentlyDeletedCommentId = action.payload;
			})
			.addCase(deleteCommentByIdAsync.rejected, (state, action) => {
				state.commentsLoading = false;
				state.errors = action.error.message || '';
			});
	},
});

export const {cleanSingleComment, cleanComments} = commentsSlice.actions;
export const commentsSelector = {
	getComments: (state: RootState) => {
		const comments = get(state.comments, 'comments.data', []) || [];
		return comments.map((comment: any) => {
			return {
				Comment: {
					identity: get(comment, 'Comment.identity', '') || '',
					labels: get(comment, 'Comment.labels', '') || '',
					properties: {
						commentBody: get(comment, 'Comment.properties.commentBody', '') || '',
						commentForEntityId: get(comment, 'Comment.properties.commentForEntityId', '') || '',
						commentForEntityType: get(comment, 'Comment.properties.commentForEntityType', '') || '',
						commentType: get(comment, 'Comment.properties.commentType', '') || '',
						createDate: get(comment, 'Comment.properties.createDate', 0) || 0,
						publishedById: get(comment, 'Comment.properties.publishedById', '') || '',
					},
				},
				User: {
					identity: get(comment, 'User.identity', '') || '',
					labels: get(comment, 'User.labels', '') || '',
					properties: {
						birthdate: get(comment, 'User.properties.birthdate', '') || '',
						createDate: get(comment, 'User.properties.createDate', 0) || 0,
						email: get(comment, 'User.properties.email', '') || '',
						firstName: get(comment, 'User.properties.firstName', '') || '',
						gender: get(comment, 'User.properties.gender', '') || '',
						isActivated: get(comment, 'User.properties.isActivated', true) || false,
						lastName: get(comment, 'User.properties.lastName', '') || '',
						myTreeIdByParent1: get(comment, 'User.properties.myTreeIdByParent1', '') || '',
						treeOwner: get(comment, 'User.properties.treeOwner', true) || false,
						updateDate: get(comment, 'User.properties.updateDate', 0) || 0,
						userPictureLink: get(comment, 'User.properties.userPictureLink', 0) || 0,
					},
				},
			};
		});
	},
	getPostComments: (state: RootState) => state.comments.comments.postComments,
	getNewCommentData: (state: RootState) => state.comments.comments.newCommentData,
	getRecentlyDeletedCommentId: (state: RootState) =>
		state.comments.comments.recentlyDeletedCommentId,
	getSingleComment: (state: RootState) => state.comments.comments.singleComment,
	getCommentsLoading: (state: RootState) => state.comments.commentsLoading,
};
export default commentsSlice.reducer;
