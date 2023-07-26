import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import get from 'lodash/get';

import api from '~api/api';
import {parseStringToJSONdata} from '~utils';
import {RootState} from '~redux/store';
import {CreateRelativeAsyncPayload, UpdateUserByIdPayload} from '~redux/@types';

import {getUserPostsByUserIdAsync} from './posts';
import {addRelativesByTreeIdAsync, getTreeInPartsByIdAsync} from './tree';
import {saveAuthUser} from './auth';

type InitialState = {
	userLoading: boolean;
	spouseLoading: boolean;
	multipleRequestsLoading: boolean;
	errors: string;
	user: any;
};

const initialState: InitialState = {
	userLoading: false,
	spouseLoading: false,
	multipleRequestsLoading: false,
	errors: '',
	user: {
		data: {},
		newUserData: {},
		recentlyDeletedUserId: null,
		spouseData: null,
		showSpouseActionSheet: false,
		newRelativeData: null,
		relationToNewUser: null,
		isInvited: false,
	},
};

export const getUserByIdAsync = createAsyncThunk<any, string>('user/getUserById', async userId => {
	const userResponse = await api.get(`/user/${userId}`);
	return userResponse.data;
});

export const getUserAndItsPostsByIdAsync = createAsyncThunk<any, string | undefined>(
	'user/getUserAndItsPostsById',
	async (userId, {dispatch}) => {
		const userResponse = await api.get(`/user/${userId}`);
		// eslint-disable-next-line no-use-before-define
		dispatch(getUserAndItsPostsByIdOnlyUserSuccess(userResponse.data));
		await dispatch(getUserPostsByUserIdAsync(userResponse.data.id));
		return userResponse.data;
	}
);

export const updateUserByIdAsync = createAsyncThunk<any, UpdateUserByIdPayload, {state: RootState}>(
	'user/updateUserSetting',
	async ({userId, userData}, {dispatch, getState}) => {
		const userResponse = await api.patch(`/user/${userId}`, userData);
		const currentAuthState = getState().auth;

		if (userResponse.data && currentAuthState.auth?.data?.id === userId) {
			dispatch(saveAuthUser(userResponse.data));
		}

		return userResponse.data;
	}
);

export const createRelativeAsync = createAsyncThunk<
	any,
	CreateRelativeAsyncPayload,
	{state: RootState}
>(
	'user/createRelativeAsync',
	async (
		{
			userId,
			treeId,
			parents,
			authUserId,
			newRelativeData,
			addRelativeViaModal,
			questionnaireCase,
			setting,
		},
		{dispatch, getState}
	) => {
		const response = await api.post('/user/add', newRelativeData);

		const newUserId = response.data.id;
		const currentState = getState().user;
		const addRelativeActionSheetOption = currentState.user.relationToNewUser;

		await dispatch(
			addRelativesByTreeIdAsync({
				treeId,
				userId,
				newUserId,
				addRelativeActionSheetOption,
				parents,
				addRelativeViaModal,
				questionnaireCase: questionnaireCase ?? null,
			})
		);

		if (addRelativeViaModal) {
			// eslint-disable-next-line no-use-before-define
			dispatch(setFamilyRelationFromCurrentUserToNewUser(null));
			await dispatch(getUserAndItsPostsByIdAsync(userId));
			await dispatch(getTreeInPartsByIdAsync({treeId, userId}));
		} else {
			await dispatch(
				updateUserByIdAsync({
					userId: authUserId ?? userId,
					userData: {setting},
				})
			);
			const authUserResponse = await dispatch(getUserByIdAsync(authUserId ?? userId));
			if (authUserResponse) {
				dispatch(saveAuthUser(authUserResponse.payload));
			}
			if (authUserId) {
				await dispatch(getUserByIdAsync(userId));
			}
		}

		return response.data;
	}
);

export const updateFamilyMemberAndAuthUserAsync = createAsyncThunk<any, any, {state: RootState}>(
	'user/updateFamilyMemberAndAuthUserAsync',
	async ({authUserId, userId, userData, setting, childId}, {dispatch}) => {
		// update settings for authUser
		await dispatch(
			updateUserByIdAsync({
				userId: authUserId,
				userData: {setting},
			})
		);
		// update user info for user by id
		const updateUserResponse = await dispatch(
			updateUserByIdAsync({
				userId,
				userData,
			})
		);

		if (updateUserResponse) {
			// get updated data for authUser
			const authUserResponse = await dispatch(getUserByIdAsync(authUserId));
			if (authUserResponse) {
				await dispatch(saveAuthUser(authUserResponse.payload));
				// case for grand parents
				childId && (await dispatch(getUserByIdAsync(childId)));
			}
		}

		return;
	}
);

export const getSpouseByIdAsync = createAsyncThunk<any, string>(
	'user/getSpouseById',
	async spouseId => {
		const response = await api.get(`/user/${spouseId}`);
		return response.data;
	}
);

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		resetUserState: state => {
			state.user = {};
		},
		resetNewUserData: state => {
			state.user.newUserData = {};
		},
		getUserAndItsPostsByIdOnlyUserSuccess: (state, {payload}) => {
			state.user.data = payload;
		},

		createUser: (_, __) => {},
		createUserLoading: state => {
			state.userLoading = true;
		},
		createUserSuccess: (state, {payload}) => {
			state.userLoading = false;
			state.user.newUserData = payload;
		},
		createUserFailure: (state, {payload}) => {
			state.userLoading = false;
			state.errors = payload;
		},

		updateUserById: (_, __) => {},
		updateUserByIdLoading: state => {
			state.userLoading = true;
		},
		updateUserByIdSuccess: (state, {payload}) => {
			state.userLoading = false;
			state.user.data = payload;
		},
		updateUserByIdFailure: (state, {payload}) => {
			state.userLoading = false;
			state.errors = payload;
		},

		deleteUserById: (_, __) => {},
		deleteUserByIdLoading: state => {
			state.userLoading = true;
		},
		deleteUserByIdSuccess: (state, {payload}) => {
			state.userLoading = false;
			state.user.recentlyDeletedUserId = payload;
		},
		deleteUserByIdFailure: (state, {payload}) => {
			state.userLoading = false;
			state.errors = payload;
		},

		resetSpouseData: state => {
			state.user.spouseData = null;
		},
		hideSpouseActionSheet: state => {
			state.user.showSpouseActionSheet = false;
		},
		setFamilyRelationFromCurrentUserToNewUser: (state, {payload}) => {
			state.user.relationToNewUser = payload;
		},
		updateUserInvitedStatusSuccess: (state, {payload}) => {
			state.userLoading = false;
			state.user.isInvited = payload;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getUserAndItsPostsByIdAsync.pending, state => {
				state.userLoading = true;
			})
			.addCase(getUserAndItsPostsByIdAsync.fulfilled, (state, action) => {
				state.userLoading = false;
				state.user.data = action.payload;
			})
			.addCase(getUserAndItsPostsByIdAsync.rejected, (state, action) => {
				state.userLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(getUserByIdAsync.pending, state => {
				state.userLoading = true;
			})
			.addCase(getUserByIdAsync.fulfilled, (state, action) => {
				state.userLoading = false;
				state.user.data = action.payload;
			})
			.addCase(getUserByIdAsync.rejected, (state, action) => {
				state.userLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(createRelativeAsync.pending, state => {
				state.multipleRequestsLoading = true;
			})
			.addCase(createRelativeAsync.fulfilled, (state, action) => {
				state.multipleRequestsLoading = false;
				state.user.newRelativeData = action.payload;
			})
			.addCase(createRelativeAsync.rejected, (state, action) => {
				state.multipleRequestsLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(getSpouseByIdAsync.pending, state => {
				state.spouseLoading = true;
			})
			.addCase(getSpouseByIdAsync.fulfilled, (state, action) => {
				state.spouseLoading = false;
				state.user.spouseData = action.payload;
				state.user.showSpouseActionSheet = true;
			})
			.addCase(getSpouseByIdAsync.rejected, state => {
				state.spouseLoading = false;
			})
			.addCase(updateUserByIdAsync.pending, state => {
				state.userLoading = true;
			})
			.addCase(updateUserByIdAsync.fulfilled, (state, action) => {
				state.userLoading = false;
				state.user.data = action.payload;
			})
			.addCase(updateUserByIdAsync.rejected, state => {
				state.userLoading = false;
			})
			.addCase(updateFamilyMemberAndAuthUserAsync.pending, state => {
				state.userLoading = true;
			})
			.addCase(updateFamilyMemberAndAuthUserAsync.fulfilled, state => {
				state.userLoading = false;
			})
			.addCase(updateFamilyMemberAndAuthUserAsync.rejected, state => {
				state.userLoading = false;
			});
	},
});

export const {
	createUser,
	createUserLoading,
	createUserSuccess,
	createUserFailure,

	getUserAndItsPostsByIdOnlyUserSuccess,
	updateUserById,
	updateUserByIdLoading,
	updateUserByIdSuccess,
	updateUserByIdFailure,
	deleteUserById,
	deleteUserByIdLoading,
	deleteUserByIdSuccess,
	deleteUserByIdFailure,
	resetNewUserData,
	resetSpouseData,
	hideSpouseActionSheet,
	setFamilyRelationFromCurrentUserToNewUser,
	resetUserState,
	updateUserInvitedStatusSuccess,
} = userSlice.actions;

export default userSlice.reducer;
export const userSelector = {
	getUser: (state: RootState) => ({
		data: get(state.user, 'user.data', {}) || {},
		newUserData: get(state.user, 'user.newUserData', {}) || {},
		recentlyDeletedUserId: get(state.user, 'user.recentlyDeletedUserId', null) || null,
		showSpouseActionSheet: get(state.user, 'user.showSpouseActionSheet', false) || false,
		newRelativeData: get(state.user, 'user.newRelativeData', null) || null,
		relationToNewUser: get(state.user, 'user.relationToNewUser', null) || null,
	}),
	getUserLoading: (state: RootState) => state.user.userLoading,
	getSpouseLoading: (state: RootState) => state.user.spouseLoading,
	getMultipleRequestsLoading: (state: RootState) => state.user.multipleRequestsLoading,
	getErrors: (state: RootState) => state.user.errors,
	isInvitedUser: (state: RootState) => state.user.user.isInvited,
};

// Select first text from Introduction Field
export const userIntroductionFirstTextSelector = (state: RootState) => {
	const parsedData = parseStringToJSONdata(state.user.user.data?.introduction);

	if (parsedData?.stories) {
		delete parsedData?.stories;
	}

	const preparedData = parsedData && Object.values(parsedData)?.flat();
	const onlyText =
		preparedData?.length && preparedData?.filter((item: any) => item?.type === 'text');

	return onlyText;
};

// Select first image from Introduction Field
export const userIntroductionFirstImageSelector = (state: RootState) => {
	const parsedData = parseStringToJSONdata(state.user.user.data?.introduction);

	if (parsedData?.stories) {
		delete parsedData?.stories;
	}

	const preparedData = parsedData && Object.values(parsedData)?.flat();
	const onlyImage =
		preparedData?.length && preparedData?.filter((item: any) => item?.type === 'images');

	return onlyImage;
};
export const facebookSocialLinkSelector = (state: RootState) => {
	const parsedData = parseStringToJSONdata(state.user.user.data?.socialNetworks);
	const onlyFacebook = parsedData?.filter((item: any) => item.name === 'Facebook');
	if (onlyFacebook?.length > 0 && onlyFacebook[0]) {
		return onlyFacebook[0];
	}
};
export const instagramSocialLinkSelector = (state: RootState) => {
	const parsedData = parseStringToJSONdata(state.user.user.data?.socialNetworks);
	const onlyInstagram = parsedData?.filter((item: any) => item.name === 'Instagram');
	if (onlyInstagram?.length > 0 && onlyInstagram[0]) {
		return onlyInstagram[0];
	}
};
export const twitterSocialLinkSelector = (state: RootState) => {
	const parsedData = parseStringToJSONdata(state.user.user.data?.socialNetworks);
	const onlyTwitter = parsedData?.filter((item: any) => item.name === 'Twitter');
	if (onlyTwitter?.length > 0 && onlyTwitter[0]) {
		return onlyTwitter[0];
	}
};
export const linkedinSocialLinkSelector = (state: RootState) => {
	const parsedData = parseStringToJSONdata(state.user.user.data?.socialNetworks);
	const onlyLinkedin = parsedData?.filter((item: any) => item.name === 'Linkedin');
	if (onlyLinkedin?.length > 0 && onlyLinkedin[0]) {
		return onlyLinkedin[0];
	}
};
