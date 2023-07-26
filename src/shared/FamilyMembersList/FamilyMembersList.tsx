import React, {useEffect, useState} from 'react';

import {ListRenderItem} from 'react-native';
import {ScrollView, Box, Text, FlatList, VStack} from 'native-base';
import {useSelector} from 'react-redux';
import dayjs from 'dayjs';
import {useTheme} from '@react-navigation/native';
import Spinner from 'react-native-loading-spinner-overlay';

import {userSelector} from '~redux/slices/user';
import {treeSelector} from '~redux/slices/tree';
import {authSelector} from '~redux/slices/auth';

import FamilyMembersListItem from './components/FamilyMembersListItem';
import FamilyMembersGroupCard from './components/FamilyMembersGroupCard';
import AddRelativesButton from './components/AddRelativesButton';
import {IRelative} from '~interfaces/IRelative';

const FamilyMembersList = () => {
	const user = useSelector(userSelector.getUser);
	const authUser = useSelector(authSelector.getAuthUser);

	const {colors} = useTheme();

	const [children, setChildren] = useState(user?.data?.kids);

	useEffect(() => {
		setChildren(user?.data?.kids);
	}, [user]);

	const [parents, setParents] = useState(user?.data?.parents);

	useEffect(() => {
		setParents(user?.data?.parents);
	}, [user]);

	const [siblings, setSiblings] = useState(user?.data?.siblings);

	useEffect(() => {
		setSiblings(user?.data?.siblings);
	}, [user]);

	const [spouse, setSpouse] = useState(user?.data?.spouse);

	useEffect(() => {
		setSpouse(user?.data?.spouse);
	}, [user]);

	const multipleRequestsLoading = useSelector(userSelector.getMultipleRequestsLoading);
	const treeLoading = useSelector(treeSelector.getTreeLoading);

	const renderItem: ListRenderItem<IRelative> = ({item}) => {
		const age = item?.properties?.birthdate
			? dayjs(dayjs()).diff(item?.properties?.birthdate, 'year')
			: '';
		const isInviteVisible = !item.properties.isActivated && item.identity !== authUser?.data?.id;
		return (
			<FamilyMembersListItem
				familyMemberId={item.identity}
				name={item?.properties?.firstName + ' ' + item?.properties?.lastName}
				age={age}
				// familyRole={'Mother'}
				// generation="0G"
				avatarImageUrl={item?.properties?.userPictureLink}
				isInviteVisible={isInviteVisible}
			/>
		);
	};

	if (multipleRequestsLoading || treeLoading) {
		return <Spinner visible={multipleRequestsLoading || treeLoading} color={colors.primary} />;
	} else {
		return (
			<ScrollView paddingX={3} paddingY={2} showsVerticalScrollIndicator={false}>
				<VStack>
					<Box alignSelf="center" width="100%">
						<AddRelativesButton
							iconColor={colors.primary}
							textColor={colors.text}
							userData={{
								userId: user.data?.id,
								treeId: user.data?.myTreeIdByParent1,
							}}
							userFamily={{parents, spouse, children, siblings}}
						/>
					</Box>
					<Box alignSelf="flex-start">
						<Text
							fontFamily="Roboto-Regular"
							fontWeight={500}
							fontSize={16}
							lineHeight={19}
							fontStyle="normal"
							marginY={4}
							color={colors.text}
						>
							Family Members
						</Text>
					</Box>
				</VStack>
				{parents?.length > 0 && (
					<FamilyMembersGroupCard groupTitle="Parents">
						<FlatList
							paddingY={2}
							showsVerticalScrollIndicator={false}
							data={parents}
							keyExtractor={(item: IRelative): string => item?.identity}
							renderItem={renderItem}
						/>
					</FamilyMembersGroupCard>
				)}
				{siblings?.length > 0 && (
					<FamilyMembersGroupCard groupTitle="Brothers/Sisters">
						<FlatList
							paddingY={2}
							showsVerticalScrollIndicator={false}
							data={siblings}
							keyExtractor={(item: IRelative): string => item?.identity}
							renderItem={renderItem}
						/>
					</FamilyMembersGroupCard>
				)}
				{children?.length > 0 && (
					<FamilyMembersGroupCard groupTitle="Children">
						<FlatList
							paddingY={2}
							showsVerticalScrollIndicator={false}
							data={children}
							keyExtractor={(item: IRelative): string => item.identity}
							renderItem={renderItem}
						/>
					</FamilyMembersGroupCard>
				)}
				{spouse?.length > 0 && (
					<FamilyMembersGroupCard groupTitle="Spouse/Partner">
						<FlatList
							paddingY={2}
							showsVerticalScrollIndicator={false}
							data={spouse}
							keyExtractor={(item: IRelative): string => item?.identity}
							renderItem={renderItem}
						/>
					</FamilyMembersGroupCard>
				)}
			</ScrollView>
		);
	}
};

export {FamilyMembersList};
