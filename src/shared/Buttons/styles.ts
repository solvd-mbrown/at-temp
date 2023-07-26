import {StyleSheet, StyleProp, ViewStyle} from 'react-native';

type Styles = {
	buttonContainer: (
		bgColor?: string,
		isFullWidth?: boolean,
		width?: string,
		isBordered?: boolean,
		marginTop?: number
	) => StyleProp<ViewStyle>;
};

const styles = StyleSheet.create<Styles | any>({
	buttonContainer: (
		bgColor?: string,
		isFullWidth?: boolean,
		width?: string,
		isBordered?: boolean,
		marginTop?: number
	) => ({
		backgroundColor: isBordered ? 'white' : bgColor,
		alignSelf: 'center',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderRadius: 6,
		minWidth: isFullWidth ? '100%' : width,
		minHeight: 44,
		borderWidth: isBordered ? 1 : 0,
		borderColor: bgColor || (isBordered ? '#E8AD63' : ''),
		marginTop: 0 || marginTop,
	}),
});

export default styles;
