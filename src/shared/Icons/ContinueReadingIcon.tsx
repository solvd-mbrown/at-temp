import React from 'react';
import {Icon} from 'native-base';
import {Path} from 'react-native-svg';

const ContinueReadingIcon = () => {
	return (
		<Icon size="20px" viewBox="0 0 20 20">
			<Path
				fill="#fff"
				d="M16.575 7.958a.834.834 0 0 0-.742-.458h-4.166v-5a.834.834 0 0 0-1.509-.533l-6.666 9.166a.833.833 0 0 0-.067.834.834.834 0 0 0 .742.533h4.166v5a.833.833 0 0 0 1.509.492l6.666-9.167a.834.834 0 0 0 .067-.867ZM10 14.933v-3.266a.833.833 0 0 0-.833-.834H5.833L10 5.067v3.266a.833.833 0 0 0 .833.834h3.334L10 14.933Z"
			/>
		</Icon>
	);
};

export default ContinueReadingIcon;
