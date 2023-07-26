import React, {FC} from 'react';

import {useWindowDimensions, View, Platform} from 'react-native';
import {Text, ScrollView} from 'native-base';
import {useTheme} from '@react-navigation/native';
import {AgeType} from '~types/AgeType';

import styles from './styles';

type UserNameTextProps = {
	username: string;
	age?: AgeType;
};

const UserNameText: FC<UserNameTextProps> = ({username, age}) => {
	const {width: windowWidth} = useWindowDimensions();

	const {colors} = useTheme();
	return (
		<ScrollView
			showsHorizontalScrollIndicator={false}
			horizontal
			style={[styles.container, {width: Platform.OS === 'android' ? windowWidth - 50 : '100%'}]}
		>
			<Text
				fontFamily="Roboto-Regular"
				fontWeight={500}
				fontSize={24}
				lineHeight={28}
				fontStyle="normal"
				paddingBottom={0.5}
				color={colors.text}
			>
				{`${username}${age || age === 0 ? `, ${age}` : ''}`}
			</Text>
			{Platform.OS === 'android' && <View style={styles.additionalView} />}
		</ScrollView>
	);
};

export {UserNameText};
