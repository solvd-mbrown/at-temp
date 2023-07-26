import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	add: {
		position: 'absolute',
		alignSelf: 'flex-end',
		justifyContent: 'center',
		alignItems: 'center',
		bottom: scale(140),
		right: scale(15),
		width: scale(80),
		height: scale(80),
		borderRadius: 40,
		backgroundColor: '#E8AD63',
		paddingX: scale(27),
		shadowOffset: {width: 0, height: 18},
		shadowColor: 'rgb(28, 59, 84)',
		shadowRadius: 20,
		shadowOpacity: 0.1,
		elevation: 100,
	},
});

export default styles;
