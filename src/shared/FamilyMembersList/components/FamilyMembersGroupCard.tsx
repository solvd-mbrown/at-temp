import React, {FC, ReactNode} from 'react';

import {View} from 'react-native';
import {VStack, Text} from 'native-base';
import {useTheme} from '@react-navigation/native';

import styles from './styles';

type FamilyMembersGroupCardProps = {
	groupTitle: string;
	children: ReactNode;
};

const FamilyMembersGroupCard: FC<FamilyMembersGroupCardProps> = ({
	groupTitle = 'parents',
	children,
}) => {
	const {colors} = useTheme();
	return (
		<View style={styles.shadowBox}>
			<VStack mb={4}>
				<Text
					fontFamily="Roboto-Regular"
					textAlign="left"
					fontWeight={400}
					fontSize={14}
					lineHeight={20}
					fontStyle="normal"
					marginBottom={4}
					color={colors.text}
				>
					{groupTitle}
				</Text>
				<VStack
					borderWidth={1}
					backgroundColor="white"
					borderStyle="solid"
					borderColor="#EFF2F5"
					borderRadius={6}
				>
					{children}
				</VStack>
			</VStack>
		</View>
	);
};

export default FamilyMembersGroupCard;
