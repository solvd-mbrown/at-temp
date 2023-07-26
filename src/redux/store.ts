import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import rootSaga from '~redux/sagas/rootSaga';

import postsSlice from './slices/posts';
import userSlice from './slices/user';
import treeSlice from './slices/tree';
import fileUploadsSlice from './slices/fileUploads';
import commentsSlice from './slices/comments';
import authSlice from './slices/auth';
import deepLinks from './slices/deepLinks';

const sagaMiddleware = createSagaMiddleware();

const middleware = [sagaMiddleware];

const store = configureStore({
	reducer: {
		posts: postsSlice,
		user: userSlice,
		tree: treeSlice,
		fileUploads: fileUploadsSlice,
		comments: commentsSlice,
		auth: authSlice,
		deepLinks: deepLinks,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({serializableCheck: false}).concat(middleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
