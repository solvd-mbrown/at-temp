import React, {FC, useCallback} from 'react';

import {Linking, Alert, TouchableOpacity} from 'react-native';

import {useTheme} from '@react-navigation/native';
import {Box, HStack, Text, VStack} from 'native-base';

import {CustomButton} from '~shared';
import {ZoomInIcon, TapIcon, LongTapIcon, DoubleTapIcon} from '~shared/Icons';
import {HELP_URL} from '~utils';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

import styles from './styles';

type TipsScreenProps = StackScreenPropsWithParams<RouteStackList.TipsScreen>;

const TipsScreen: FC<TipsScreenProps> = ({navigation}) => {
	const {colors} = useTheme();

	const handlePress = useCallback(async () => {
		const supported = await Linking.canOpenURL(HELP_URL);
		if (supported) {
			await Linking.openURL(HELP_URL);
		} else {
			Alert.alert(`Don't know how to open this URL: ${HELP_URL}`);
		}
	}, []);

	return (
		<Box
			height="100%"
			width="100%"
			paddingY={20}
			position="relative"
			backgroundColor="rgba(0, 0, 0, 0.7)"
		>
			<VStack paddingX={6}>
				<Text
					fontWeight={500}
					fontSize={32}
					lineHeight={38}
					color="white"
					marginBottom={8}
					alignSelf="center"
				>
					Navigation Tips
				</Text>
				<HStack style={styles.tipWrapper}>
					<ZoomInIcon />
					<Text style={styles.tipDescription}>Zoom in/out</Text>
				</HStack>
				<HStack style={styles.tipWrapper}>
					<TapIcon />
					<Text style={styles.tipDescription}>Single tap - view user’s Profile</Text>
				</HStack>
				<HStack style={styles.tipWrapper}>
					<LongTapIcon />
					<Text style={styles.tipDescription} flexShrink={1} flexWrap="wrap">
						Long press - open action menu where you can add a relative, view user’s tree
					</Text>
				</HStack>
				<HStack style={[styles.tipWrapper, styles.doubleTap]}>
					<DoubleTapIcon />
					<Text style={styles.tipDescription}>Double tap to zoom in</Text>
				</HStack>
			</VStack>
			<Box flex="1" justifyContent="center">
				<TouchableOpacity onPress={handlePress}>
					<Text alignSelf="center" fontWeight={700} fontSize={16} lineHeight={24} color="white">
						Need more help?
					</Text>

					<Text
						alignSelf="center"
						fontWeight={500}
						fontSize={16}
						lineHeight={24}
						color="white"
						textDecorationLine="underline"
					>
						Go to RTree online Help Center
					</Text>
				</TouchableOpacity>
			</Box>
			<Box position="absolute" alignSelf="center" bottom={30}>
				<CustomButton
					textColor="white"
					onPress={() => navigation.goBack()}
					title="Got it"
					bgColor={colors.primary}
				/>
			</Box>
		</Box>
	);
};

export default TipsScreen;
