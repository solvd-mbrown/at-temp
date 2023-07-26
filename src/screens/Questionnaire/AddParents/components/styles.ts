import {StyleSheet} from 'react-native';
import {scale} from 'react-native-utils-scale';

const styles = StyleSheet.create({
	avatarImage: {
		minHeight: scale(96),
		minWidth: scale(96),
		borderRadius: 100,
		marginRight: scale(16),
	},
});

export default styles;
