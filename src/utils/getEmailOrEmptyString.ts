import {checkIfEmailGeneratedInsideApp} from './checkIfEmailGeneratedInsideApp';

const getEmailOrEmptyString = (email: string = ''): string => {
	if (checkIfEmailGeneratedInsideApp(email)) {
		return '';
	}
	return email;
};

export {getEmailOrEmptyString};
