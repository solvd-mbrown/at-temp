import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	zoomButtons: {
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		backgroundColor: 'white',
		right: 30,
		bottom: 90,
		width: scale(48),
		height: scale(48),
	},
	refreshButton: {
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		backgroundColor: 'white',
		left: 30,
		bottom: 30,
		width: scale(48),
		height: scale(48),
	},
	tipsButton: {
		bottom: 90,
		width: scale(48),
		height: scale(48),
	},
	bottomZoomButton: {
		bottom: 32,
	},
	shadowBox: {
		shadowOffset: {width: 0, height: 6},
		shadowColor: 'black',
		borderRadius: 8,
		shadowOpacity: 0.1,
		elevation: 10,
		backgroundColor: '#0000',
	},
	touchArea: {
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconsSize: {
		fontSize: 24,
		fontWeight: '500',
		lineHeight: 28,
	},
});

export default styles;
