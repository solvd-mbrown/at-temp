import React from 'react';

import {scale} from 'react-native-utils-scale';
import SkipButton from './SkipButton';

export const SkipButtonOptions = {
	headerRight: () => <SkipButton />,
	headerRightContainerStyle: {
		paddingRight: scale(16),
	},
};
