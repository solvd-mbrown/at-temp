import React from 'react';
import {Icon} from 'native-base';
import {Path} from 'react-native-svg';

const WorkIcon = () => {
	return (
		<Icon size="24px" viewBox="0 0 24 24">
			<Path
				fill="#252A31"
				fillRule="evenodd"
				clipRule="evenodd"
				d="M14 6V4H10V6H14ZM4 8V19H20V8H4ZM20 6C21.11 6 22 6.89 22 8V19C22 20.11 21.11 21 20 21H4C2.89 21 2 20.11 2 19L2.01 8C2.01 6.89 2.89 6 4 6H8V4C8 2.89 8.89 2 10 2H14C15.11 2 16 2.89 16 4V6H20Z"
			/>
		</Icon>
	);
};

export default WorkIcon;
