import {createSlice} from '@reduxjs/toolkit';
import get from 'lodash/get';

import api from '~api/api';
import {RootState} from '~redux/store';

const initialState = {
	uploading: false,
	errors: '',
	cancelUploading: false,
	fileUploads: {
		data: {
			singleImageUrl: '',
			multiImageUrl: [],
			loaded: 0,
			total: 0,
		},
	},
};

const fileUploadsSlice = createSlice({
	name: 'fileUploads',
	initialState,
	reducers: {
		createFileUploads: state => {
			state.uploading = true;
		},
		createFileUploadsSuccess: (state, {payload}) => {
			state.uploading = false;
			state.fileUploads.data.singleImageUrl = payload;
		},
		createFilesUploadsSuccess: (state, {payload}) => {
			state.uploading = false;
			state.fileUploads.data.multiImageUrl = payload;
		},
		createFileUploadsFailure: (state, {payload}) => {
			state.uploading = false;
			state.errors = payload;
		},
		restoreFileUploads: state => {
			state.fileUploads.data.multiImageUrl = [];
		},
		restoreSingleFileUpload: state => {
			state.fileUploads.data.singleImageUrl = '';
		},
		loadedFileUpload: (state, {payload}) => {
			state.fileUploads.data.loaded = payload;
		},
		totalFileUpload: (state, {payload}) => {
			state.fileUploads.data.total = payload;
		},
		restoreSizeFileUpload: state => {
			state.fileUploads.data.loaded = 0;
			state.fileUploads.data.total = 0;
		},
		setCancelUploading: (state, {payload}) => {
			state.cancelUploading = payload;
		},
		restoreErrorMessage: state => {
			state.errors = '';
		},
	},
});

export const {
	createFileUploads,
	createFileUploadsSuccess,
	createFilesUploadsSuccess,
	createFileUploadsFailure,
	restoreFileUploads,
	restoreSingleFileUpload,
	loadedFileUpload,
	totalFileUpload,
	restoreSizeFileUpload,
	setCancelUploading,
	restoreErrorMessage,
} = fileUploadsSlice.actions;

export const fileUploadsSelector = {
	getFileUploads: (state: RootState) => ({
		multiImageUrl: get(state.fileUploads, 'fileUploads.data.multiImageUrl', []) || [],
		singleImageUrl: get(state.fileUploads, 'fileUploads.data.singleImageUrl', '') || '',
		loaded: get(state.fileUploads, 'fileUploads.data.loaded', 0) || 0,
		total: get(state.fileUploads, 'fileUploads.data.total', 0) || 0,
	}),
	getCancelUploading: (state: RootState) => state.fileUploads.cancelUploading,
	getUploading: (state: RootState) => state.fileUploads.uploading,
	getError: (state: RootState) => state.fileUploads.errors,
};

export default fileUploadsSlice.reducer;

export const createFilesUploadsAsync =
	(files: any, email: string, AbortUploadingController: any) =>
	async (dispatch: any, getState: any) => {
		dispatch(restoreErrorMessage());
		dispatch(createFileUploads());
		try {
			const arrayFormsData = files.map(({uri, fileName, type}: any) => {
				const formData = new FormData();
				formData.append('file', {
					uri: uri,
					name: fileName,
					type: type,
				});
				return formData;
			});

			const arrayResponses = await Promise.all(
				arrayFormsData.map(async (data: any) => {
					return await api.post(`/file/upload/${email}`, data, {
						headers: {
							'Content-Type': 'multipart/form-data',
						},
						signal: AbortUploadingController.signal,
						onUploadProgress: ({loaded, total}) => {
							const currentState = getState().fileUploads;
							if (currentState.cancelUploading) {
								AbortUploadingController.abort();
								dispatch(setCancelUploading(false));
								return;
							}
							dispatch(totalFileUpload(total));
							dispatch(loadedFileUpload(loaded));
						},
					});
				})
			);

			dispatch(createFilesUploadsSuccess(arrayResponses?.map(({data}) => data.Location)));
		} catch (error: any) {
			console.log('createFileUploadsAsync Error :>> ', error);
			dispatch(createFileUploadsFailure(error.message));
		}
	};

export const createFileUploadsAsync =
	(file: any, email: string, AbortUploadingController: any) =>
	async (dispatch: any, getState: any) => {
		dispatch(restoreErrorMessage());
		dispatch(createFileUploads());
		try {
			console.log('file :>> ', file);
			const formData = new FormData();
			formData.append('file', {
				uri: file.uri,
				name: file.fileName,
				type: file.type,
			});

			const response = await api.post(`/file/upload/${email}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
				signal: AbortUploadingController.signal,
				onUploadProgress: ({loaded, total}) => {
					const currentState = getState().fileUploads;
					if (currentState.cancelUploading) {
						AbortUploadingController.abort();
						dispatch(setCancelUploading(false));
						return;
					}
					dispatch(totalFileUpload(total));
					dispatch(loadedFileUpload(loaded));
				},
			});

			if (response?.data?.Location?.length > 0) {
				dispatch(createFileUploadsSuccess(response?.data?.Location));
			}
		} catch (error: any) {
			console.log('createFileUploadsAsync Error :>> ', error.message);
			dispatch(createFileUploadsFailure(error.message));
		}
	};
