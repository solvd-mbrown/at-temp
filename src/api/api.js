import axios from 'axios';

import {BASE_URL, getAuthToken} from '~utils';

const instance = axios.create({
	baseURL: BASE_URL,
});

instance.interceptors.request.use(
	async config => {
		const token = await getAuthToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	err => {
		return Promise.reject(err);
	}
);

const initUser = token => {
	return instance
		.get(`/user/initUser/${token}`)
		.then(response => ({response}))
		.catch(error => ({error}));
};

const createUser = userData => {
	return instance
		.post('/user/add', userData)
		.then(response => ({response}))
		.catch(error => ({error}));
};

const updateUserById = (id, userData) => {
	return instance
		.patch(`/user/${id}`, userData)
		.then(response => ({response}))
		.catch(error => ({error}));
};
const deleteUserById = id => {
	return instance
		.delete(`/user/remove/${id}`)
		.then(response => ({response}))
		.catch(error => ({error}));
};

const updateUserSettings = (id, userData) => {
	return instance
		.patch(`/user/${id}`, userData)
		.then(response => ({response}))
		.catch(error => ({error}));
};

export const API = {
	initUser,
	createUser,
	updateUserById,
	deleteUserById,
	updateUserSettings,
};

export default instance;
