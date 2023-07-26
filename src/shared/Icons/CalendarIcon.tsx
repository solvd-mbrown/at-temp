import React from 'react';
import {Icon} from 'native-base';
import {Path} from 'react-native-svg';

const CalendarIcon = () => {
	return (
		<Icon size="20px" viewBox="0 0 20 20">
			<Path
				fill="#252A31"
				d="M17 2h-2V1a1 1 0 0 0-2 0v1H7V1a1 1 0 0 0-2 0v1H3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3Zm1 15a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-7h16v7Zm0-9H2V5a1 1 0 0 1 1-1h2v1a1 1 0 0 0 2 0V4h6v1a1 1 0 0 0 2 0V4h2a1 1 0 0 1 1 1v3Z"
			/>
		</Icon>
	);
};

export default CalendarIcon;
