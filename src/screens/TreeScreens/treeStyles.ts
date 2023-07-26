import {StyleSheet} from 'react-native';

import {fontScale, scale} from 'react-native-utils-scale';

const treeStyles = StyleSheet.create({
	mainContainer: {
		paddingHorizontal: 10,
	},
	nodeStyle: {
		maxWidth: scale(80),
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
		resizeMode: 'cover',
	},
	nodeTitleStyle: {
		fontSize: fontScale(18),
		fontWeight: 'bold',
		fontStyle: 'normal',
	},
	imageStyle: {
		minWidth: scale(80),
		minHeight: scale(80),
		borderRadius: 50,
		resizeMode: 'cover',
	},
	spinnerStyle: {
		top: '50%',
	},
	topTreesContainersStyle: {
		marginBottom: -4.85,
		borderWidth: 2,
		borderColor: 'white',
	},
	alignSelfCenter: {
		alignSelf: 'center',
	},
});

export default treeStyles;
