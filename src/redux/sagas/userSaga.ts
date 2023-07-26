import {all, call, put, takeLatest} from 'redux-saga/effects';
import {PayloadAction} from '@reduxjs/toolkit';

import {CreateUserPayload, UpdateUserByIdPayload} from '~redux/@types';
import {API} from '~api/api';
import {saveAuthUser, signInWithTokenFailure, signInWithTokenSuccess} from '~redux/slices/auth';
import {
	createUser,
	createUserFailure,
	createUserLoading,
	createUserSuccess,
	deleteUserByIdLoading,
	deleteUserByIdFailure,
	deleteUserByIdSuccess,
	updateUserById,
	updateUserByIdFailure,
	updateUserByIdLoading,
	updateUserByIdSuccess,
	deleteUserById,
	updateUserInvitedStatusSuccess,
} from '~redux/slices/user';

import {QUESTIONNAIRE_SETTINGS} from '~utils';

function* createUserWorker(action: PayloadAction<CreateUserPayload>) {
	const {userData, shouldSaveAsAuthUser} = action.payload;
	const bodyData = {
		...userData,
		setting: JSON.stringify({
			...QUESTIONNAIRE_SETTINGS,
		}),
	};
	yield put(createUserLoading());
	const {response, error} = yield call(API.createUser, bodyData);
	if (response && response.data) {
		yield put(createUserSuccess(response.data));
		if (shouldSaveAsAuthUser) {
			yield put(saveAuthUser(response.data));
			yield put(signInWithTokenSuccess(response.data));
		}
	} else {
		yield put(createUserFailure(error.message));
		yield put(signInWithTokenFailure(error.message));
	}
}

function* updateUserByIdWorker(action: PayloadAction<UpdateUserByIdPayload>) {
	const {userId, userData, isSignUp} = action.payload;
	yield put(updateUserByIdLoading());
	const {response, error} = yield call(API.updateUserById, userId, userData);
	if (response && response.data) {
		const isActivated = response.data.response?.isActivated;
		if (isActivated) {
			yield put(updateUserInvitedStatusSuccess(isActivated));
			yield put(createUser({userData: {email: userData.email}, shouldSaveAsAuthUser: true}));
		} else {
			yield put(updateUserByIdSuccess(response.data));
			if (isSignUp) {
				yield put(saveAuthUser(response.data));
				yield put(signInWithTokenSuccess(response.data));
			}
		}
	} else {
		yield put(updateUserByIdFailure(error.message));
	}
}

function* deleteUserByIdWorker(action: PayloadAction<string>) {
	yield put(deleteUserByIdLoading());
	const {response, error} = yield call(API.deleteUserById, action.payload);
	if (response && response.data && response.data.response === 'done') {
		yield put(deleteUserByIdSuccess(action.payload));
	} else {
		yield put(deleteUserByIdFailure(error.message));
	}
}

export default function* userWatcher() {
	yield all([
		takeLatest(createUser, createUserWorker),
		takeLatest(updateUserById, updateUserByIdWorker),
		takeLatest(deleteUserById, deleteUserByIdWorker),
	]);
}
