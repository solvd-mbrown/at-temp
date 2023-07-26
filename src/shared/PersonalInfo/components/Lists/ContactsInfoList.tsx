import React from 'react';

import {useSelector} from 'react-redux';
import {Box} from 'native-base';

import {userSelector} from '~redux/slices/user';

import {getEmailOrEmptyString} from '~utils';

import BasicInfoItem from '../BasicInfoItem';
import InfoSectionHeader from '../InfoSectionHeader';

const ContactsInfoList = () => {
	const user = useSelector(userSelector.getUser);

	const userData = user?.data;

	const maskedPhone = userData?.phone
		? userData?.phone.slice(0, 3) +
		  '-' +
		  userData?.phone.slice(3, 6) +
		  '-' +
		  userData?.phone.slice(6)
		: '  ';

	return (
		<Box>
			<InfoSectionHeader
				title="Contacts"
				userId={userData?.id}
				navigationTarget="EditProfileContactsScreen"
			/>
			{getEmailOrEmptyString(userData?.email).length > 0 && (
				<BasicInfoItem title={userData?.email} description="Email" />
			)}
			{maskedPhone && maskedPhone?.trim().length > 0 && (
				<BasicInfoItem isPhoneCallRedirect title={maskedPhone} description="Phone" />
			)}
		</Box>
	);
};

export default ContactsInfoList;
