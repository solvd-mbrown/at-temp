import {all} from 'redux-saga/effects';

import authWatcher from '~redux/sagas/authSaga';
import userWatcher from '~redux/sagas/userSaga';

export default function* rootSaga() {
	yield all([authWatcher(), userWatcher()]);
}
