import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	shadowBox: {
		shadowOffset: {width: 0, height: 5},
		shadowColor: 'rgb(28, 59, 84)',
		shadowRadius: 16,
		shadowOpacity: 0.05,
		elevation: 100,
		backgroundColor: '#0000',
	},
	avatarImage: {
		minHeight: scale(64),
		minWidth: scale(64),
		borderRadius: 100,
		marginRight: scale(16),
	},
	inviteFamilyMemberContainer: {
		height: scale(40),
		width: '25%',
		alignSelf: 'center',
		marginLeft: scale(20),
	},
	button: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#EFF2F5',
		borderRadius: 6,
	},
});

export default styles;
