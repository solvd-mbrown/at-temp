import {StyleSheet} from 'react-native';
import {fontScale, scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	scrollContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		width: '100%',
		backgroundColor: 'white',
	},
	appNameTitle: {
		fontFamily: 'Roboto-Regular',
		fontWeight: '400',
		textAlign: 'center',
		fontSize: fontScale(25),
		marginBottom: scale(10),
		paddingTop: scale(3),
	},
	welcomeTitle: {
		fontFamily: 'Roboto-Regular',
		fontWeight: '600',
		textAlign: 'center',
		fontSize: fontScale(20),
		marginBottom: scale(14),
	},
	askInfoAbout: {
		fontFamily: 'Roboto-Regular',
		fontWeight: '600',
		textAlign: 'center',
		fontSize: fontScale(20),
		marginBottom: scale(14),
	},
	logo: {
		height: scale(150),
		width: '100%',
		marginTop: 65,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: scale(10),
	},
});

export {styles};
