import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	footerContainer: {
		paddingBottom: 60,
	},
	scrollContainer: {
		paddingHorizontal: scale(20),
		paddingBottom: 20,
		paddingVertical: 8,
		width: '100%',
		backgroundColor: 'white',
	},
	button: {
		width: scale(40),
		height: scale(40),
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#DDDDDD',
	},
	video: {
		alignSelf: 'center',
		width: '100%',
		height: '100%',
	},
	textInput: {
		fontFamily: 'Roboto-Regular',
		paddingBottom: 25,
	},
	editProfileScreenScrollContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		paddingTop: scale(4),
		width: '100%',
		backgroundColor: 'white',
	},
	avatarContainer: {
		marginTop: scale(34),
		marginBottom: scale(24),
	},
	avatarImage: {
		minWidth: scale(120),
		minHeight: scale(120),
		borderRadius: 100,
	},
	contactsScrollConrtainer: {
		paddingTop: 4,
		paddingBottom: 20,
		width: '100%',
		height: '100%',
		backgroundColor: 'white',
	},
	basicInfoScrollContainer: {
		paddingTop: 4,
		paddingBottom: 20,
		width: '100%',
		backgroundColor: 'white',
	},
	icon: {
		marginRight: scale(10),
	},
	socialScreenScrollContainer: {
		paddingTop: 4,
		paddingBottom: 20,
		width: '100%',
		height: '100%',
		backgroundColor: 'white',
	},
});

export default styles;
