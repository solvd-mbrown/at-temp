import {StyleSheet} from 'react-native';

const VideoStyles = StyleSheet.create({
	video: {
		alignSelf: 'center',
		width: '100%',
		height: '100%',
	},
	playControlContainer: {
		width: '100%',
		height: '100%',
		position: 'absolute',
		zIndex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	playPressArea: {
		width: '100%',
		height: '100%',
	},
});

export default VideoStyles;
