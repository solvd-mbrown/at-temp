import React, {FC} from 'react';

import {useWindowDimensions, View, Platform, StyleProp, TextStyle} from 'react-native';
import {Text, ScrollView} from 'native-base';
import {useTheme} from '@react-navigation/native';

type FamilyMemberNameProps = {
	name: string;
	style?: StyleProp<TextStyle>;
};

const FamilyMemberName: FC<FamilyMemberNameProps> = ({name, style}) => {
	const {width: windowWidth} = useWindowDimensions();

	const {colors} = useTheme();

	return (
		<ScrollView
			showsHorizontalScrollIndicator={false}
			horizontal
			style={{
				// TODO: check if these styles should be applied to contentContainerStyle prop
				width: Platform.OS === 'android' ? windowWidth - 50 : '100%',
				flexGrow: 0,
				paddingBottom: 4,
			}}
		>
			<Text
				fontFamily="Roboto-Regular"
				fontWeight={500}
				fontSize={16}
				lineHeight={19}
				fontStyle="normal"
				marginBottom={0.5}
				color={colors.text}
				style={style}
			>
				{name}
			</Text>
			{Platform.OS === 'android' && <View style={{minWidth: 100}} />}
		</ScrollView>
	);
};

export default FamilyMemberName;
