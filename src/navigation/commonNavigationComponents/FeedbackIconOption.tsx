import React from 'react';

import {TouchableOpacity} from 'react-native';
import {Box} from 'native-base';
import {scale} from 'react-native-utils-scale';

import {FeedbackIcon} from '~shared/Icons';

import {RouteStackList} from '~types/NavigationTypes';
import {FeedBackIconOptionPropType} from '~types/FeedBackIconProp';

export const FeedbackIconOption = (navigation: FeedBackIconOptionPropType) => ({
	headerRight: () => (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={() => navigation.navigate(RouteStackList.FeedbackScreen)}
		>
			<Box width={10} height={10} justifyContent="center" alignItems="center">
				<FeedbackIcon />
			</Box>
		</TouchableOpacity>
	),
	headerRightContainerStyle: {
		paddingRight: scale(16),
	},
});
