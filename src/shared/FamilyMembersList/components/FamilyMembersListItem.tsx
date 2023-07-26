import React, {FC} from 'react';

import {TouchableOpacity} from 'react-native';

import {HStack, VStack, Text} from 'native-base';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {scale} from 'react-native-utils-scale';
import {useTheme} from '@react-navigation/native';

import {noGenderAvatarImage} from '~images';

import FamilyMemberDescription from './FamilyMemberDescription';
import InviteFamilyMemberStatus from './InviteFamilyMemberStatus';

import styles from './styles';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';

type FamilyMembersListItemProps = {
	name: string;
	age?: number | string;
	familyRole?: string;
	generation?: string;
	familyMemberId: string;
	avatarImageUrl?: string;
	isInviteVisible: boolean;
};

const FamilyMembersListItem: FC<FamilyMembersListItemProps> = ({
	name,
	age,
	familyRole,
	generation,
	familyMemberId,
	avatarImageUrl,
	isInviteVisible,
}) => {
	const navigation =
		useNavigation<StackNavigationPropsWithParams<RouteStackList.UserProfileScreen>>();
	const {colors} = useTheme();

	const onPress = (): void =>
		navigation.navigate(RouteStackList.UserProfileScreen, {userId: familyMemberId});
	return (
		<TouchableOpacity onPress={onPress}>
			<HStack width="100%" height={scale(90)} paddingX={3} paddingY={2}>
				<HStack alignItems="center" width={'70%'}>
					<FastImage
						source={avatarImageUrl ? {uri: avatarImageUrl} : noGenderAvatarImage}
						resizeMode={FastImage.resizeMode.cover}
						style={styles.avatarImage}
					/>
					<VStack alignItems="flex-start" textAlign="left" width={'70%'}>
						<Text
							fontFamily="Roboto-Regular"
							fontWeight={500}
							fontSize={16}
							lineHeight={19}
							fontStyle="normal"
							marginBottom={0.5}
							color={colors.text}
							numberOfLines={1}
						>
							{`${name}${age || age === 0 ? `, ${age}` : ''}`}
						</Text>
						<FamilyMemberDescription familyRole={familyRole} generation={generation} />
					</VStack>
				</HStack>

				{isInviteVisible && (
					<InviteFamilyMemberStatus
						inviteStatus={'Invite'}
						name={name}
						familyMemberId={familyMemberId}
					/>
				)}
			</HStack>
		</TouchableOpacity>
	);
};

export default FamilyMembersListItem;
