import {put, call, all, takeLatest, select} from 'redux-saga/effects';
import {PayloadAction} from '@reduxjs/toolkit';

import {getAuthToken} from '~utils';
import {API} from '~api/api';
import {createUser, updateUserById} from '~redux/slices/user';
import {
	signInUser,
	signInWithTokenLoading,
	signInWithTokenFailure,
	signInWithTokenSuccess,
	SignInUserPayload,
} from '~redux/slices/auth';
import {deepLinksSelector} from '~redux/slices/deepLinks';

function* signInUserWorker(action: PayloadAction<SignInUserPayload>) {
	yield put(signInWithTokenLoading());
	const {email} = action.payload;
	const token: string = yield getAuthToken();
	const {response, error} = yield call(API.initUser, token);
	const {
		params: {userId},
	} = yield select(deepLinksSelector.getInviteLink);
	if (response) {
		if (response?.data?.id && response?.data?.email) {
			yield put(signInWithTokenSuccess(response?.data));
		} else {
			if (userId) {
				const userData = {email, isInvitedUser: true};
				yield put(updateUserById({userId, userData, isSignUp: true}));
			} else {
				const userData = {email};
				yield put(createUser({userData, shouldSaveAsAuthUser: true}));
			}
		}
	} else {
		yield put(signInWithTokenFailure(error));
	}
}

export default function* authWatcher() {
	yield all([takeLatest(signInUser, signInUserWorker)]);
}
