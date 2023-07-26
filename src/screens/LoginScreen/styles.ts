import {StyleSheet} from 'react-native';
import {fontScale, scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	logo: {
		height: scale(150),
		width: '100%',
		marginTop: 65,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: scale(40),
	},
	socialButton: {
		width: '85%',
		marginTop: scale(14),
	},
	signInTitle: {
		fontFamily: 'Roboto-Regular',
		fontWeight: '500',
		textAlign: 'center',
		fontSize: fontScale(32),
		lineHeight: fontScale(32),
		marginBottom: scale(32),
	},
});

export default styles;
