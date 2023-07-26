import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import get from 'lodash/get';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import {RootState} from '~redux/store';
import {AuthData} from '~redux/@types';

import {parseStringToJSONdata, removeAuthToken} from '~utils';
import {QuestionnaireSettings} from '~types/QuestionnaireSettings';
import api from '~api/api';

type InitialStateType = {
	authLoading: boolean;
	errors: string;
	usedStorageLoading: boolean;
	auth: {
		data: AuthData | null;
		isAuthorized: boolean;
		usedStorageSize: string;
	};
};

export type SignInUserPayload = {
	email?: string;
	userId?: string;
};

const initialState: InitialStateType = {
	authLoading: false,
	errors: '',
	usedStorageLoading: false,
	auth: {
		data: null,
		isAuthorized: false,
		usedStorageSize: '',
	},
};

export const signOutAsync = createAsyncThunk('auth/signOut', async () => {
	await GoogleSignin.signOut();
	await auth().signOut();
	await removeAuthToken();
	return;
});

export const getUsedStorageReportByEmailAsync = createAsyncThunk<any, string>(
	'auth/getUsedStorageReportByEmail',
	async email => {
		const response = await api.get(`/email/reportByEmail/${email}`);
		return response.data;
	}
);

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		signInUser: (_, __: PayloadAction<SignInUserPayload>) => {},
		signInWithTokenLoading: state => {
			state.authLoading = true;
		},
		signInWithTokenSuccess: (state, {payload}) => {
			state.authLoading = false;
			state.auth.data = payload;
			state.auth.isAuthorized = true;
		},
		signInWithTokenFailure: (state, {payload}) => {
			state.authLoading = false;
			state.errors = payload;
		},
		saveAuthUser: (state, {payload}) => {
			if (state.auth.data) {
				state.auth.data = {
					...state.auth.data,
					...payload,
				};
			} else {
				state.auth.data = payload;
			}
		},
		setDoNotShowQuestionnaireModal: (state, {payload}) => {
			if (state.auth.data) {
				state.auth.data.setting = {
					...parseStringToJSONdata(state.auth.data.setting),
					doNotShowQuestionnaireModal: payload,
				};
			}
		},
	},
	extraReducers: builder => {
		builder
			.addCase(signOutAsync.pending, state => {
				state.authLoading = true;
			})
			.addCase(signOutAsync.fulfilled, state => {
				state.authLoading = false;
				state.auth.data = null;
				state.auth.isAuthorized = false;
			})
			.addCase(signOutAsync.rejected, (state, {error}) => {
				state.authLoading = false;
				state.errors = error.message || '';
			})
			.addCase(getUsedStorageReportByEmailAsync.pending, (state, _) => {
				state.usedStorageLoading = true;
			})
			.addCase(getUsedStorageReportByEmailAsync.fulfilled, (state, action) => {
				state.usedStorageLoading = false;
				state.auth.usedStorageSize = action.payload.length ? action.payload[0].size : ' 0 Kb';
			})
			.addCase(getUsedStorageReportByEmailAsync.rejected, (state, action) => {
				state.usedStorageLoading = false;
				state.errors = action.error.message || '';
			});
	},
});

export const {
	saveAuthUser,
	signInUser,
	signInWithTokenLoading,
	signInWithTokenSuccess,
	signInWithTokenFailure,
	setDoNotShowQuestionnaireModal,
} = authSlice.actions;

export const authSelector = {
	getAuthLoading: (state: RootState) => state.auth.authLoading,
	getIsAuthorized: (state: RootState) => state.auth.auth.isAuthorized,
	getAuthUser: (state: RootState) => ({
		data: get(state.auth, 'auth.data', null) || null,
	}),
	getUsedStorageSize: (state: RootState): string => state.auth.auth.usedStorageSize,
	getUsedStorageLoading: (state: RootState) => state.auth.usedStorageLoading,
};

export const questionnaireSettingsSelector = (state: RootState) => {
	const parsedData: QuestionnaireSettings = parseStringToJSONdata(state.auth.auth.data?.setting);
	return parsedData;
};

export default authSlice.reducer;
