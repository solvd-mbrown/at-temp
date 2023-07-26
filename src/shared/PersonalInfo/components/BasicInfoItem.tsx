import React, {FC} from 'react';

import {TouchableOpacity, Linking} from 'react-native';

import {HStack, VStack, Text, Box} from 'native-base';
import FastImage, {Source} from 'react-native-fast-image';
import {useTheme} from '@react-navigation/native';

import {
	FacebookIcon,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
	EmailIcon,
	PhoneIcon,
	CalendarIcon,
	AddressIcon,
	PetsIcon,
	WorkIcon,
	GenderIcon,
	HomeTownIcon,
} from '~shared/Icons';

import styles from './styles';

type RenderIconPropsType = (description: string) => Element | undefined;

type BasicInfoItemPropsType = {
	horizontal?: boolean;
	icon?: string | Source | undefined;
	title?: string;
	description?: string;
	isSocial?: boolean;
	isPhoneCallRedirect?: boolean;
};

const renderIcon: RenderIconPropsType = description => {
	switch (description) {
		case 'Facebook':
			return (
				<Box style={styles.icon}>
					<FacebookIcon />
				</Box>
			);
		case 'Twitter':
			return (
				<Box style={styles.icon}>
					<TwitterIcon />
				</Box>
			);
		case 'Linkedin':
			return (
				<Box style={styles.icon}>
					<LinkedinIcon />
				</Box>
			);
		case 'Instagram':
			return (
				<Box style={styles.icon}>
					<InstagramIcon />
				</Box>
			);
		case 'Email':
			return (
				<Box style={styles.icon}>
					<EmailIcon />
				</Box>
			);
		case 'Phone':
			return (
				<Box style={styles.icon}>
					<PhoneIcon />
				</Box>
			);
		case 'Date of Birth':
			return (
				<Box style={styles.icon}>
					<CalendarIcon />
				</Box>
			);
		// TODO change date of Death Icon
		case 'Date of Death':
			return (
				<Box style={styles.icon}>
					<CalendarIcon />
				</Box>
			);
		case 'Address':
			return (
				<Box style={styles.icon}>
					<AddressIcon />
				</Box>
			);
		case 'Pets':
			return (
				<Box style={styles.icon}>
					<PetsIcon />
				</Box>
			);
		case 'Work':
			return (
				<Box style={styles.icon}>
					<WorkIcon />
				</Box>
			);
		case 'Gender':
			return (
				<Box style={styles.icon}>
					<GenderIcon />
				</Box>
			);
		case 'Hometown':
			return (
				<Box style={styles.icon}>
					<HomeTownIcon />
				</Box>
			);
	}
};

const BasicInfoItem: FC<BasicInfoItemPropsType> = ({
	horizontal = true,
	icon = '',
	title = '',
	description = '',
	isSocial = false,
	isPhoneCallRedirect = false,
}) => {
	const {colors} = useTheme();

	const onPress = (): void => {
		isSocial && Linking.openURL(title);
		isPhoneCallRedirect && title !== '' && Linking.openURL(`tel:${title}`);
	};
	if (horizontal) {
		return (
			<TouchableOpacity onPress={onPress}>
				<HStack mb={6}>
					{renderIcon(description)}
					<VStack ml={4} paddingRight={8} justifyContent="center" width={'100%'}>
						<Text
							fontFamily="Roboto-Regular"
							maxW={'95%'}
							color={colors.text}
							fontStyle="normal"
							fontWeight={500}
							fontSize={16}
							lineHeight={19}
							mb={2}
						>
							{title}
						</Text>
						<Text
							fontFamily="Roboto-Regular"
							color="#ACB4BE"
							fontStyle="normal"
							fontWeight={400}
							fontSize={16}
							lineHeight={16}
						>
							{description}
						</Text>
					</VStack>
				</HStack>
			</TouchableOpacity>
		);
	} else {
		return (
			<VStack>
				<FastImage
					source={icon as Source}
					resizeMode={FastImage.resizeMode.contain}
					style={styles.icon}
				/>
				<Text
					fontFamily="Roboto-Regular"
					color={colors.text}
					fontStyle="normal"
					fontWeight={500}
					fontSize={16}
					lineHeight={19}
				>
					{title}
				</Text>
			</VStack>
		);
	}
};

export default BasicInfoItem;
