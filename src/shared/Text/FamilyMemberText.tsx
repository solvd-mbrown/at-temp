import React, {FC} from 'react';

import {Text} from 'native-base';
import {useTheme} from '@react-navigation/native';

type FamilyMemberTextProps = {
	familyMemberTitle: string;
	generation: string;
};

const FamilyMemberText: FC<FamilyMemberTextProps> = ({familyMemberTitle, generation}) => {
	const {colors} = useTheme();
	return (
		<Text
			fontFamily="Roboto-Regular"
			fontWeight={400}
			fontSize={16}
			lineHeight={19}
			fontStyle="normal"
			paddingBottom={0.5}
			color={colors.text}
		>
			{familyMemberTitle}, {generation}
		</Text>
	);
};

export {FamilyMemberText};
