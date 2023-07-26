import React from 'react';
import {ListRenderItem, TouchableOpacity} from 'react-native';
import {HStack, Icon, Text} from 'native-base';
import styles from '~screens/SettingsScreen/styles';
import {MaterialIcons} from '@expo/vector-icons';

type ItemProps = {
	title: string;
	onPress?: () => void;
};

export const RenderSettingsItem: ListRenderItem<ItemProps> = ({item}) => {
	const {onPress, title} = item;

	return (
		<TouchableOpacity onPress={onPress} disabled={!onPress}>
			<HStack style={styles.optionWrapper}>
				<Text style={styles.title}>{title}</Text>
				{!!onPress && <Icon as={MaterialIcons} name="keyboard-arrow-right" size={5} />}
			</HStack>
		</TouchableOpacity>
	);
};
