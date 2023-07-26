import React, {FC} from 'react';

import {Icon} from 'native-base';
import {Path} from 'react-native-svg';
import {TabIcon} from './ITabIcon';

const NotificationsSVGTabIcon: FC<TabIcon> = ({focused}) => {
	return (
		<Icon size="31px" viewBox="0 0 23 28">
			<Path
				fill={focused ? '#E8AD63' : '#ACB4BE'}
				d="M19.375 15.573v-4.24a8 8 0 0 0-6.666-7.88V2a1.334 1.334 0 0 0-2.667 0v1.453a8 8 0 0 0-6.667 7.88v4.24a4 4 0 0 0-2.667 3.76V22a1.333 1.333 0 0 0 1.334 1.333h4.187a5.333 5.333 0 0 0 10.293 0h4.187A1.333 1.333 0 0 0 22.041 22v-2.667a4 4 0 0 0-2.667-3.76Zm-13.333-4.24a5.333 5.333 0 1 1 10.667 0v4H6.042v-4Zm5.333 13.333a2.667 2.667 0 0 1-2.293-1.333h4.586a2.667 2.667 0 0 1-2.293 1.334Zm8-4h-16v-1.333A1.333 1.333 0 0 1 4.708 18h13.334a1.333 1.333 0 0 1 1.333 1.333v1.334Z"
			/>
		</Icon>
	);
};

export default NotificationsSVGTabIcon;
