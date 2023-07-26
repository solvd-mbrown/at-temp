import React, {FC} from 'react';

import {Box, Text} from 'native-base';
import {useTheme} from '@react-navigation/native';

import {CustomButton} from '~shared';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

type CongratulationModalScreenProps =
	StackScreenPropsWithParams<RouteStackList.CongratulationModalScreen>;

const CongratulationModalScreen: FC<CongratulationModalScreenProps> = ({navigation, route}) => {
	const {lastName} = route.params;
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
				<Text mb={3}>
					Congratulations! You have successfully joined {lastName}`s family tree on RTree.
				</Text>
				<Text mb={3}>
					I’m so excited to have you on board and can`t wait to explore our family history together.
					You`ll be able to see all the information that I have uncovered so far, and you can start
					adding your own branch to the tree.
				</Text>
				<Text>
					Thank you for joining me on RTree, and I look forward to discovering more about our family
					history with you.
				</Text>
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

export default CongratulationModalScreen;
