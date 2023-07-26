import React from 'react';

import {StyleSheet, TouchableOpacity, View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {HStack, Text} from 'native-base';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';

import {userIntroductionFirstImageSelector} from '~redux/slices/user';

import {ContinueReadingIcon} from '~shared/Icons';

import styles from './styles';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';

const ContinueReadingButton = () => {
	const firstImageItem = useSelector(userIntroductionFirstImageSelector);
	const navigation =
		useNavigation<StackNavigationPropsWithParams<RouteStackList.UserIntroductionScreen>>();

	const onPress = (): any => navigation.navigate(RouteStackList.UserIntroductionScreen);

	return (
		<TouchableOpacity onPress={onPress}>
			<HStack marginY={4}>
				<FastImage
					source={{
						uri: firstImageItem ? firstImageItem[0]?.images[0].imageLink : '',
					}}
					resizeMode={FastImage.resizeMode.cover}
					style={styles.backgroundImage}
				>
					<View style={[StyleSheet.absoluteFillObject, styles.backgroundOverlay]} />
					<HStack>
						<ContinueReadingIcon />
						<Text
							fontFamily="Roboto-Regular"
							color="white"
							fontStyle="normal"
							fontWeight={500}
							fontSize={16}
							marginLeft={3}
							lineHeight={22}
						>
							Continue reading
						</Text>
					</HStack>
				</FastImage>
			</HStack>
		</TouchableOpacity>
	);
};

export default ContinueReadingButton;
