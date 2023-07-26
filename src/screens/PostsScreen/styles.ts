import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	scrollContainer: {
		paddingHorizontal: 16,
		paddingBottom: 100,
		paddingVertical: 4,
		width: '100%',
		minHeight: '100%',
		backgroundColor: 'white',
		position: 'relative',
	},
	button: {
		width: scale(40),
		height: scale(40),
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
	},
	video: {
		alignSelf: 'center',
		width: '100%',
		height: '100%',
	},
	container: {
		marginBottom: 0,
		paddingTop: 16,
		fontFamily: 'Roboto-Regular',
		paddingBottom: 25,
	},
	containerWithMargin: {
		marginBottom: 106,
	},
});

export {styles};
