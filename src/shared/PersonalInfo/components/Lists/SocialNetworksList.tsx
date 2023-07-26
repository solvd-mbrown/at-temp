import React, {useEffect, useState} from 'react';

import {useSelector} from 'react-redux';
import {Box, FlatList} from 'native-base';

import {userSelector} from '~redux/slices/user';

import {parseStringToJSONdata} from '~utils';

import InfoSectionHeader from '../InfoSectionHeader';
import BasicInfoItem from '../BasicInfoItem';
import {ListRenderItem} from 'react-native';

type SocialNetworksType = {
	name: string;
	link: string;
};

type ItemProps = {
	link: string;
	name: string;
};

const SocialNetworksList = () => {
	const user = useSelector(userSelector.getUser);

	const userData = user?.data;

	const [socialNetworks, setSocialNetworks] = useState<SocialNetworksType[]>(
		user?.data?.socialNetworks
	);

	useEffect(() => {
		setSocialNetworks(
			parseStringToJSONdata(user?.data?.socialNetworks)?.filter(
				(item: SocialNetworksType) => item?.link?.length > 0
			)
		);
	}, [user]);

	const renderItem: ListRenderItem<ItemProps> = ({item}) => {
		return <BasicInfoItem title={item.link} description={item.name} isSocial={true} />;
	};

	return (
		<Box>
			<InfoSectionHeader
				title="Social Networks"
				userId={userData?.id}
				navigationTarget={'EditProfileSocialScreen'}
			/>

			<FlatList
				paddingY={2}
				showsVerticalScrollIndicator={false}
				data={socialNetworks}
				keyExtractor={item => item.name}
				renderItem={renderItem}
			/>
		</Box>
	);
};

export default SocialNetworksList;
