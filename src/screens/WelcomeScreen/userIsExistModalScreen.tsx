import React, {FC} from 'react';

import {Box, Text} from 'native-base';
import {useTheme} from '@react-navigation/native';

import {CustomButton} from '~shared';

const UserIsExistModalScreen: FC<any> = ({navigation}) => {
	const {colors} = useTheme();
	return (
		<Box
			height="100%"
			width="100%"
			padding={5}
			justifyContent="center"
			alignItems="center"
			backgroundColor="rgba(0, 0, 0, 0.7)"
		>
			<Box backgroundColor="white" padding={5} borderRadius={10}>
				<Text mb={3}>This invite link was already used.</Text>
				<Box pt={5}>
					<CustomButton
						width="40%"
						textColor="white"
						onPress={() => navigation.goBack()}
						title="OK"
						bgColor={colors.primary}
					/>
				</Box>
			</Box>
		</Box>
	);
};

export default UserIsExistModalScreen;
