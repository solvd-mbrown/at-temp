import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	image: {
		minHeight: scale(48),
		minWidth: scale(48),
		borderRadius: 100,
		marginRight: scale(16),
		marginLeft: scale(16),
	},
	commentIcon: {
		marginRight: scale(8),
		alignSelf: 'center',
	},
	username: {
		fontSize: 20,
		lineHeight: 23,
	},
	more: {
		position: 'absolute',
		zIndex: 1000,
		top: 0,
		right: 0,
		paddingRight: 8,
		paddingTop: 4,
		width: scale(50),
		height: scale(50),
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: 'white',
		shadowOffset: {width: -15, height: 5},
		shadowOpacity: 0.93,
		shadowRadius: 4.5,
	},
	viewMoreText: {
		paddingHorizontal: scale(16),
		marginBottom: scale(4),
	},
});

export default styles;
