import React, {FC} from 'react';

import {Text} from 'native-base';
import {useTheme} from '@react-navigation/native';

type PersonalInfoTitlePropType = {
	title: string;
};

const PersonalInfoTitle: FC<PersonalInfoTitlePropType> = ({title}) => {
	const {colors} = useTheme();

	return (
		<Text
			fontFamily="Roboto-Regular"
			fontWeight={500}
			fontStyle="normal"
			fontSize={20}
			lineHeight={23}
			color={colors.text}
			marginY={4}
		>
			{title}
		</Text>
	);
};

export default PersonalInfoTitle;
