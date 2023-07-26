import React, {FC} from 'react';

import {HStack} from 'native-base';

import {EditProfileIcon} from '~shared';

import PersonalInfoTitle from './PersonalInfoTitle';

type InfoSectionHeaderPropsType = {
	userId: string;
	title: string;
	navigationTarget: string;
};

const InfoSectionHeader: FC<InfoSectionHeaderPropsType> = ({userId, title, navigationTarget}) => {
	return (
		<HStack justifyContent="space-between" alignItems="center">
			<PersonalInfoTitle title={title} />
			<EditProfileIcon userId={userId} navigationTarget={navigationTarget} />
		</HStack>
	);
};

export default InfoSectionHeader;
