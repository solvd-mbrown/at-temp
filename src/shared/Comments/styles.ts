import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	input: {
		width: '85%',
		fontSize: 14,
		paddingTop: 0,
		paddingBottom: 0,
		flexDirection: 'row',
		fontFamily: 'Roboto-Regular',
	},
	button: {
		width: scale(45),
		borderRadius: 6,
		height: '100%',
		backgroundColor: '#E8AD63',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	container: {
		justifyContent: 'flex-end',
		flex: 1,
	},
	listContainer: {
		paddingBottom: 80,
		paddingTop: 10,
	},
});

const keyboardStyles = StyleSheet.create(() => ({
	inputWrapper: (iosKeyboardHeight: number) => ({
		borderRadius: 6,
		backgroundColor: '#EFF2F5',
		justifyContent: 'space-between',
		alignItems: 'center',
		position: 'absolute',
		alignSelf: 'center',
		flexDirection: 'row',
		paddingLeft: 12,
		padding: 5,
		width: '90%',
		height: scale(50),
		bottom: 0,
		marginBottom: iosKeyboardHeight > 0 ? iosKeyboardHeight + 10 : 20,
	}),
}));

export {styles, keyboardStyles};
