import React from 'react';
import {ScrollView, Box} from 'native-base';

import PersonalInfoTitle from './components/PersonalInfoTitle';
import PersonalInfoIntroductionText from './components/PersonalInfoIntroductionText';
import ContinueReadingButton from './components/ContinueReadingButton';
import BasicInfoList from './components/Lists/BasicInfoList';
import ContactsInfoList from './components/Lists/ContactsInfoList';
import SocialNetworksList from './components/Lists/SocialNetworksList';
import SubSectionList from './components/Lists/SubSectionList';

const PersonalInfo = () => {
	return (
		<ScrollView paddingX={4} paddingY={2} showsVerticalScrollIndicator={false}>
			<PersonalInfoTitle title="About me" />
			<SubSectionList />
			<PersonalInfoIntroductionText />
			<ContinueReadingButton />

			<BasicInfoList />

			<ContactsInfoList />

			<Box>
				<SocialNetworksList />
			</Box>
		</ScrollView>
	);
};

export {PersonalInfo};
