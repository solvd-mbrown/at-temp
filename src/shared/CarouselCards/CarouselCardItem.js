import React from 'react';

import {View, Text, StyleSheet, TouchableHighlight} from 'react-native';

import {CloseIcon, AddIcon, Box} from 'native-base';
import {scale} from 'react-native-utils-scale';
import FastImage from 'react-native-fast-image';

const styles = StyleSheet.create({
	button: {
		width: scale(40),
		height: scale(40),
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#DDDDDD',
	},
	counterWrapper: {
		width: scale(35),
		justifyContent: 'center',
		alignItems: 'center',
		height: scale(25),
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	counter: {
		color: 'orange',
	},
	image: {
		height: scale(200),
		width: '100%',
	},
});

const CarouselCardItem = ({
	image,
	index,
	deleteCard,
	onOpenActionSheet,
	totalImages,
	sectionType,
	editable,
}) => {
	return (
		<Box key={index}>
			<FastImage
				source={{uri: image}}
				resizeMode={FastImage.resizeMode.contain}
				style={[styles.image, {backgroundColor: totalImages > index ? '#0000' : 'orange'}]}
			>
				<Box
					style={{
						height: '100%',
						alignItems: totalImages > index ? 'flex-end' : 'center',
						justifyContent: totalImages > index ? 'space-between' : 'center',
					}}
					padding={15}
				>
					{(sectionType === 'post' || editable || !totalImages) && (
						<TouchableHighlight
							underlayColor={totalImages > index && editable ? '#DDDDD' : 'orange'}
							activeOpacity={0.7}
							style={styles.button}
							onPress={() => {
								editable
									? totalImages > index
										? deleteCard(index)
										: onOpenActionSheet(index)
									: sectionType === 'post' && deleteCard(index);
							}}
						>
							{totalImages > index ? <CloseIcon /> : <AddIcon />}
						</TouchableHighlight>
					)}
					{totalImages > 1 && totalImages > index && (
						<View style={styles.counterWrapper}>
							<Text fontFamily="Roboto-Regular" style={styles.counter}>{`${
								index + 1
							}/${totalImages}`}</Text>
						</View>
					)}
				</Box>
			</FastImage>
		</Box>
	);
};

export default CarouselCardItem;
