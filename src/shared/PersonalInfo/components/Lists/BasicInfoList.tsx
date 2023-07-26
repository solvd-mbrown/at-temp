import React from 'react';

import {Box} from 'native-base';
import {useSelector} from 'react-redux';
import dayjs from 'dayjs';

import {userSelector} from '~redux/slices/user';

import BasicInfoItem from '../BasicInfoItem';
import InfoSectionHeader from '../InfoSectionHeader';

const BasicInfoList = () => {
	const user = useSelector(userSelector.getUser);
	const userData = user?.data;
	const addressArea = userData?.address && JSON.parse(userData?.address);
	const genderData = userData?.gender || '';
	const petsData = userData?.pets || '';
	const workData = userData?.employerAndPosition || '';
	const bornData = userData?.bornAddress || '';

	const dateOfBirth = userData?.birthdate
		? dayjs(userData?.birthdate).format('MMMM-DD-YYYY').toString()
		: '';
	const dateOfDeath = userData?.dateOfDeath
		? dayjs(userData?.dateOfDeath).format('MMMM-DD-YYYY').toString()
		: '';

	const fullAddressInfo =
		(addressArea?.address ? `${addressArea?.address}` : '') +
		(addressArea?.streetAddress ? `, ${addressArea?.streetAddress}` : '') +
		(addressArea?.apartment ? `, ${addressArea?.apartment}` : '') +
		(addressArea?.city ? `, ${addressArea?.city}` : '') +
		(addressArea?.state ? `, ${addressArea?.state}` : '') +
		(addressArea?.zip ? `, ${addressArea?.zip}` : '');

	return (
		<Box>
			<InfoSectionHeader
				title="Basic Info"
				userId={userData?.id}
				navigationTarget="EditProfileBasicInfoScreen"
			/>
			{!!dateOfBirth && <BasicInfoItem title={dateOfBirth} description="Date of Birth" />}
			{!!dateOfDeath && <BasicInfoItem title={dateOfDeath} description="Date of Death" />}
			{!!genderData && <BasicInfoItem title={genderData} description="Gender" />}
			{!!bornData && <BasicInfoItem title={bornData} description="Hometown" />}
			{!!(
				addressArea?.address ||
				addressArea?.streetAddress ||
				addressArea?.apartment ||
				addressArea?.city ||
				addressArea?.state ||
				addressArea?.zip
			) && (
				<BasicInfoItem
					title={
						fullAddressInfo[0] === ','
							? fullAddressInfo.substring(2, fullAddressInfo.length)
							: fullAddressInfo
					}
					description="Address"
				/>
			)}
			{!!workData && <BasicInfoItem title={workData} description="Work" />}
			{!!petsData && <BasicInfoItem title={petsData} description="Pets" />}
		</Box>
	);
};

export default BasicInfoList;
