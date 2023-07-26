import {Platform, StyleSheet} from 'react-native';
import {fontScale, scale} from 'react-native-utils-scale';

export const styles = StyleSheet.create({
	button: {
		top: Platform.OS === 'ios' ? 16 : 0,
		right: Platform.OS === 'ios' ? 16 : 0,
		position: 'absolute',
		width: scale(40),
		height: scale(40),
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		alignSelf: 'flex-end',
		backgroundColor: '#DDDDDD',
		zIndex: 10,
	},
	errorLabel: {
		fontSize: fontScale(16),
		color: 'red',
		alignSelf: 'flex-start',
		display: 'flex',
		marginTop: scale(2),
		marginBottom: scale(2),
	},
	icon: {
		marginRight: scale(10),
	},
});
