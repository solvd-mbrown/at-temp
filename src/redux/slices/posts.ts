import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import get from 'lodash/get';

import api from '~api/api';
import {CreatePostAsyncPayload, UpdatePostByIdAsyncPayload} from '~redux/@types';
import {RootState} from '~redux/store';

const initialState = {
	postsLoading: false,
	errors: '',
	posts: {
		data: [],
		treePostsData: [],
		newPostsData: {},
		recentlyDeletedPostId: null,
		singlePost: {},
	},
};

export const getUserPostsByUserIdAsync = createAsyncThunk<any, string>(
	'posts/getUserPostsByUserId',
	async userId => {
		const postsResponse = await api.get(`/post/user/${+userId}`);
		return postsResponse.data;
	}
);

export const getTreeMembersPostsByTreeIdAsync = createAsyncThunk<any, string>(
	'posts/getTreeMembersPostsByTreeId',
	async treeId => {
		const treeMembersPostsResponse = await api.get(`/post/all/${treeId}`);
		return treeMembersPostsResponse.data;
	}
);

export const getSinglePostByIdAsync = createAsyncThunk<any, string>(
	'posts/getSinglePostById',
	async postId => {
		const singlePostResponse = await api.get(`/post/${postId}`);
		return singlePostResponse.data;
	}
);

export const createPostAsync = createAsyncThunk<any, CreatePostAsyncPayload>(
	'posts/createPost',
	async ({userId = '', treeId, postType, postBody}) => {
		const postData = {
			publishedById: +userId,
			treeUUID: treeId,
			postType,
			postBody,
		};

		const postResponse = await api.post('/post/add', postData);
		return postResponse.data;
	}
);

export const updatePostByIdAsync = createAsyncThunk<any, UpdatePostByIdAsyncPayload>(
	'posts/updatePostById',
	async ({postId, userId, postBody, comments}) => {
		const postData = {
			publishedById: userId,
			postBody,
			comments,
		};
		const updatePostResponse = await api.patch(`/post/${postId}`, postData);
		return updatePostResponse.data;
	}
);

export const deletePostByIdAsync = createAsyncThunk<any, string | undefined>(
	'posts/deletePostById',
	async postId => {
		const deletePostResponse = await api.delete(`/post/${postId}`);
		return deletePostResponse.data;
	}
);

const postsSlice = createSlice({
	name: 'posts',
	initialState,
	reducers: {
		cleanSinglePost: state => {
			state.posts.singlePost = {};
		},
		cleanNewPostData: state => {
			state.posts.newPostsData = {};
		},
		cleanPosts: state => {
			state.posts.data = [];
			state.posts.treePostsData = [];
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getUserPostsByUserIdAsync.fulfilled, (state, action) => {
				state.posts.data = action.payload;
			})
			.addCase(getUserPostsByUserIdAsync.rejected, (state, action) => {
				state.errors = action.error.message || '';
			})
			.addCase(getTreeMembersPostsByTreeIdAsync.pending, (state, _) => {
				state.postsLoading = true;
			})
			.addCase(getTreeMembersPostsByTreeIdAsync.fulfilled, (state, action) => {
				state.postsLoading = false;
				state.posts.treePostsData = action.payload;
			})
			.addCase(getTreeMembersPostsByTreeIdAsync.rejected, (state, action) => {
				state.postsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(getSinglePostByIdAsync.pending, (state, _) => {
				state.postsLoading = true;
			})
			.addCase(getSinglePostByIdAsync.fulfilled, (state, action) => {
				state.postsLoading = false;
				state.posts.singlePost = action.payload;
			})
			.addCase(getSinglePostByIdAsync.rejected, (state, action) => {
				state.postsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(createPostAsync.pending, (state, _) => {
				state.postsLoading = true;
			})
			.addCase(createPostAsync.fulfilled, (state, action) => {
				state.postsLoading = false;
				state.posts.newPostsData = action.payload;
			})
			.addCase(createPostAsync.rejected, (state, action) => {
				state.postsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(updatePostByIdAsync.pending, (state, _) => {
				state.postsLoading = true;
			})
			.addCase(updatePostByIdAsync.fulfilled, (state, action) => {
				state.postsLoading = false;
				state.posts.newPostsData = action.payload;
			})
			.addCase(updatePostByIdAsync.rejected, (state, action) => {
				state.postsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(deletePostByIdAsync.pending, (state, _) => {
				state.postsLoading = true;
			})
			.addCase(deletePostByIdAsync.fulfilled, (state, action) => {
				state.postsLoading = false;
				state.posts.recentlyDeletedPostId = action.payload;
			})
			.addCase(deletePostByIdAsync.rejected, (state, action) => {
				state.postsLoading = false;
				state.errors = action.error.message || '';
			});
	},
});

export const {cleanSinglePost, cleanNewPostData, cleanPosts} = postsSlice.actions;
export const postsSelector = {
	getPosts: (state: RootState) => {
		const posts = get(state.posts, 'posts.data', []) || [];

		return posts.map((post: any) => {
			return {
				id: get(post, 'id', '') || '',
				labels: get(post, 'labels', '') || '',
				postBody: get(post, 'postBody', '') || '',
				postType: get(post, 'postType', '') || '',
				treeUUID: get(post, 'treeUUID', '') || '',
				createDate: get(post, 'createDate', 0) || 0,
				publishedById: get(post, 'publishedById', '') || '',
				comments: get(post, 'comments', []) || [],
			};
		});
	},
	getTreePostsData: (state: RootState) => state.posts.posts.treePostsData,
	getNewPostsData: (state: RootState) => state.posts.posts.newPostsData,
	getRecentlyDeletedPostId: (state: RootState) => state.posts.posts.recentlyDeletedPostId,
	getSinglePost: (state: RootState) => state.posts.posts.singlePost,
	getPostsLoading: (state: RootState) => state.posts.postsLoading,
};

export default postsSlice.reducer;
