import React, {FC} from 'react';

import {Icon} from 'native-base';
import {Path} from 'react-native-svg';
import {TabIcon} from './ITabIcon';

const TreeSVGTabIcon: FC<TabIcon> = ({focused}) => {
	return (
		<Icon size="30px" viewBox="0 0 30 30">
			<Path
				fill={focused ? '#E8AD63' : '#ACB4BE'}
				d="M28.209 19h-2.667v-4a1.333 1.333 0 0 0-1.334-1.333h-8V11h2.667a1.334 1.334 0 0 0 1.334-1.333v-8A1.334 1.334 0 0 0 18.875.333h-8a1.333 1.333 0 0 0-1.333 1.334v8A1.334 1.334 0 0 0 10.875 11h2.667v2.667h-8A1.333 1.333 0 0 0 4.209 15v4H1.542a1.334 1.334 0 0 0-1.334 1.333v8a1.333 1.333 0 0 0 1.334 1.334h8a1.333 1.333 0 0 0 1.333-1.334v-8A1.333 1.333 0 0 0 9.542 19H6.875v-2.667h16V19H20.21a1.333 1.333 0 0 0-1.334 1.333v8a1.333 1.333 0 0 0 1.334 1.334h8a1.333 1.333 0 0 0 1.333-1.334v-8A1.333 1.333 0 0 0 28.208 19Zm-20 2.667V27H2.875v-5.333H8.21Zm4-13.334V3h5.333v5.333h-5.334ZM26.875 27h-5.333v-5.333h5.333V27Z"
			/>
		</Icon>
	);
};

export default TreeSVGTabIcon;
