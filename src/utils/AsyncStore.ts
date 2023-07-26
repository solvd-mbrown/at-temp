import AsyncStorage from '@react-native-async-storage/async-storage';

const storeAuthToken = async (value: string) => {
	try {
		await AsyncStorage.setItem('auth_token', value);
	} catch (error) {
		console.log('StoreAuthTokenError:', error);
	}
};

const getAuthToken = async () => {
	try {
		const authToken = await AsyncStorage.getItem('auth_token');
		return authToken;
	} catch (error) {
		console.log('GetAuthTokenError', error);
	}
};

const removeAuthToken = async () => {
	try {
		await AsyncStorage.removeItem('auth_token');
	} catch (error) {
		console.log('RemoveAuthTokenError', error);
	}
};

export {storeAuthToken, getAuthToken, removeAuthToken};
