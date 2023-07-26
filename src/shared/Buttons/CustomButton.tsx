import React, {FC, ReactNode, LegacyRef} from 'react';

import {TouchableOpacity} from 'react-native';

import {Text} from 'native-base';

import styles from './styles';

type CustomButtonProps = {
	ref?: LegacyRef<TouchableOpacity> | undefined;
	onPress: () => void;
	title?: string;
	icon?: ReactNode;
	marginTop?: number;
	isNotDisabled?: boolean;
	bgColor?: string;
	isFullWidth?: boolean;
	width?: string;
	isBordered?: boolean;
	textColor?: string;
	fontSize?: number;
};

const CustomButton: FC<CustomButtonProps> = ({
	ref,
	onPress,
	title,
	icon,
	marginTop,
	isNotDisabled,
	bgColor = '#E8AD63',
	isFullWidth = false,
	width = '90%',
	isBordered = false,
	textColor = '#FFF',
	fontSize = 14,
}) => {
	return (
		<TouchableOpacity
			ref={ref}
			onPress={onPress}
			disabled={isNotDisabled}
			style={styles.buttonContainer(bgColor, isFullWidth, width, isBordered, marginTop)}
		>
			{icon}
			<Text
				fontFamily="Roboto-Regular"
				color={textColor}
				textAlign="center"
				fontStyle="normal"
				fontWeight={500}
				fontSize={fontSize}
				lineHeight={20}
			>
				{title}
			</Text>
		</TouchableOpacity>
	);
};

export {CustomButton};
