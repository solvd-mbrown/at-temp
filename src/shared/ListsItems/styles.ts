import {StyleSheet} from 'react-native';

import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	button: {
		width: scale(40),
		height: scale(40),
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#DDDDDD',
	},
});

export default styles;
