import {StyleSheet, StyleProp, ViewStyle, TextStyle} from 'react-native';
import {ImageStyle} from 'react-native-fast-image';

type Styles = {
	errorLabel: (
		marginTopErrorLabel?: number | undefined,
		marginBottomErrorLabel?: number | undefined
	) => StyleProp<TextStyle>;
	container: (
		error?: string | undefined,
		bgColor?: string | undefined,
		marginTop?: number | undefined
	) => StyleProp<ViewStyle>;
	innerContainer: StyleProp<ViewStyle>;
	input: StyleProp<TextStyle>;
	icon: StyleProp<ImageStyle>;
	iconLeft: StyleProp<ImageStyle>;
	iconRight: StyleProp<ViewStyle>;
	textInputMask: StyleProp<TextStyle>;
};

const styles = StyleSheet.create<Styles | any>({
	errorLabel: (
		marginTopErrorLabel?: number | undefined,
		marginBottomErrorLabel?: number | undefined
	) => ({
		fontSize: 14,
		color: 'red',
		alignSelf: 'flex-start',
		display: 'flex',
		marginTop: marginTopErrorLabel || 5,
		marginBottom: marginBottomErrorLabel || 2,
	}),
	container: (
		error?: string | undefined,
		bgColor?: string | undefined,
		marginTop?: number | undefined
	) => ({
		backgroundColor: bgColor || 'white',
		alignSelf: 'center',
		borderRadius: 6,
		width: '100%',
		maxWidth: '100%',
		minWidth: '100%',
		height: 44,
		alignItems: 'center',
		justifyContent: 'space-between',
		flexDirection: 'row',
		marginTop: marginTop || 10,
		margin: 10,
		borderColor: error ? 'red' : 'transparent',
		borderWidth: error ? 2 : 0,
	}),
	innerContainer: {
		flexDirection: 'row',
		height: '100%',
		alignItems: 'center',
		paddingHorizontal: 10,
		width: '100%',
	},
	input: {
		position: 'relative',
		fontSize: 16,
		width: '100%',
		fontWeight: 'normal',
		color: '#252A31',
	},
	disabled: {
		color: '#8F8F8F',
	},
	iconRight: {
		marginRight: 10,
		right: 0,
		position: 'absolute',
	},
	icon: {
		height: 20,
		width: 20,
		marginRight: 10,
		position: 'relative',
	},
	textInputMask: {
		width: '100%',
		height: '100%',
	},
});

export default styles;
