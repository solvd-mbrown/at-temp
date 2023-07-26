import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	icon: {
		width: scale(48),
		height: scale(48),
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F8F5EC',
		borderRadius: 12,
	},
	backgroundImage: {
		width: '100%',
		minHeight: 88,
		justifyContent: 'center',
		alignItems: 'center',
	},
	backgroundOverlay: {
		backgroundColor: '#000000',
		opacity: 0.6,
	},
});

export default styles;
