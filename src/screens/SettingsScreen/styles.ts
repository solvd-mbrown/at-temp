import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
	optionWrapper: {
		height: 70,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomColor: '#EFF2F5',
		borderBottomWidth: 1,
	},
	title: {
		fontSize: 16,
		lineHeight: 19,
	},
	buttonWrapper: {
		position: 'absolute',
		bottom: 120,
		alignSelf: 'center',
	},
	buttonText: {
		fontSize: 16,
		lineHeight: 19,
		fontWeight: '500',
		alignSelf: 'center',
		color: 'orange',
	},
	disabledButtonText: {
		color: 'grey',
	},
});

export default styles;
