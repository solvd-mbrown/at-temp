import React, {FC} from 'react';

import {TouchableOpacity} from 'react-native';

import {Icon} from 'native-base';
import {useNavigation, useTheme} from '@react-navigation/native';
import {Feather} from '@expo/vector-icons';

type EditProfileIconProps = {
	userId: string;
	sectionType?: string;
	navigationTarget: string;
};

const EditProfileIcon: FC<EditProfileIconProps> = ({userId, sectionType, navigationTarget}) => {
	const navigation = useNavigation<any>();
	const {colors} = useTheme();

	const onPress = (): void => navigation.navigate(navigationTarget, {userId, sectionType});

	return (
		<TouchableOpacity onPress={onPress}>
			<Icon as={Feather} size="md" name="edit" color={colors.primary} />
		</TouchableOpacity>
	);
};

export {EditProfileIcon};
