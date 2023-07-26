import {Platform, StyleSheet} from 'react-native';
import {fontScale, scale} from 'react-native-utils-scale';

export const styles = StyleSheet.create({
	tabBarStyle: {
		height: Platform.OS === 'ios' ? '9.5%' : '8.5%',
		paddingBottom: Platform.OS === 'ios' ? scale(25) : 0,
		paddingTop: 0,
	},
	displayFlexStyle: {
		display: 'flex',
	},
	displayNoneStyle: {
		display: 'none',
	},
	tabBarLabelStyle: {
		marginTop: Platform.OS === 'ios' ? scale(-5) : -8,
		fontSize: Platform.OS === 'ios' ? fontScale(15) : fontScale(12),
		lineHeight: 16,
		fontWeight: '500',
	},
	tabBarItemStyle: {
		marginTop: Platform.OS === 'ios' ? scale(8) : 0,
		marginBottom: Platform.OS === 'ios' ? scale(0) : scale(9),
	},
});
