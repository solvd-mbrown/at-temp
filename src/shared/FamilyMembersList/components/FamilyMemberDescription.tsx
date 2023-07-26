import React, {FC} from 'react';

import {Text} from 'native-base';
import {useTheme} from '@react-navigation/native';
import {StyleProp, TextStyle} from 'react-native';

type FamilyMemberDescriptionProps = {
	familyRole?: string;
	generation?: string;
	style?: StyleProp<TextStyle>;
};

const FamilyMemberDescription: FC<FamilyMemberDescriptionProps> = ({
	familyRole,
	generation,
	style,
}) => {
	const {colors} = useTheme();
	return (
		<Text
			fontFamily="Roboto-Regular"
			fontWeight={400}
			fontSize={14}
			lineHeight={20}
			fontStyle="normal"
			color={colors.text}
			style={style}
		>
			{familyRole} {generation}
		</Text>
	);
};

export default FamilyMemberDescription;
