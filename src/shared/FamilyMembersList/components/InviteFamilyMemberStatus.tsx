import React, {FC, useCallback} from 'react';

import {TouchableOpacity} from 'react-native';
import {Text, Box} from 'native-base';
import {useTheme} from '@react-navigation/native';

import styles from './styles';
import {useSelector} from 'react-redux';
import {authSelector} from '~redux/slices/auth';
import {DynamicLinksHelper} from '~services/dynamicLinks.helper';

type InviteFamilyMemberStatusProps = {
	inviteStatus: string;
	name: string;
	familyMemberId: string;
};

const InviteFamilyMemberStatus: FC<InviteFamilyMemberStatusProps> = ({
	inviteStatus = 'invite',
	name,
	familyMemberId,
}) => {
	const {colors} = useTheme();

	const authUser = useSelector(authSelector.getAuthUser);

	const {firstName, lastName} = authUser.data;

	const onPressHelper = useCallback(
		() =>
			DynamicLinksHelper.onInvitePress({
				firstName,
				lastName,
				invitedUserName: name,
				invitedUserId: familyMemberId,
			}),
		[firstName, lastName, name, familyMemberId]
	);

	return (
		<TouchableOpacity style={styles.inviteFamilyMemberContainer} onPress={onPressHelper}>
			<Box
				justifyContent="center"
				alignItems="center"
				bgColor="#F8F5EC"
				height="100%"
				width="100%"
				borderRadius={6}
			>
				<Text
					fontFamily="Roboto-Regular"
					fontStyle="normal"
					fontWeight={400}
					fontSize={14}
					lineHeight={20}
					color={colors.primary}
				>
					{inviteStatus}
				</Text>
			</Box>
		</TouchableOpacity>
	);
};

export default InviteFamilyMemberStatus;
