import React from 'react';

import {Box, Text} from 'native-base';
import {useSelector} from 'react-redux';

import {userIntroductionFirstTextSelector} from '~redux/slices/user';

const PersonalInfoIntroductionText = () => {
	const firstTextItem = useSelector(userIntroductionFirstTextSelector);

	return (
		<Box>
			{firstTextItem?.length > 0 && (
				<Text
					fontFamily="Roboto-Regular"
					numberOfLines={10}
					fontStyle="normal"
					fontWeight={400}
					fontSize={14}
					lineHeight={20}
				>
					{firstTextItem[0]?.text}
				</Text>
			)}
		</Box>
	);
};

export default PersonalInfoIntroductionText;
