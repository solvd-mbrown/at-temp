import React, {useState, FC} from 'react';

import {Image} from 'react-native';
import {AspectRatio} from 'native-base';
import FastImage from 'react-native-fast-image';

type ResizedImagePropsType = {
	imageLink: string;
	mediaParams?: {
		width: number;
		height: number;
	};
};

const ResizedImage: FC<ResizedImagePropsType> = ({imageLink, mediaParams}) => {
	const [imageWidth, setImageWidth] = useState(1);
	const [imageHeight, setImageHeight] = useState(1);

	const onLayout = (): void => {
		Image.getSize(
			imageLink,
			(width1, height1) => {
				!mediaParams && setImageWidth(width1);
				!mediaParams && setImageHeight(height1);
			},
			error => {
				console.error('ScaledImage,Image.getSize failed with error: ', error);
			}
		);
	};

	return (
		<AspectRatio
			w="100%"
			ratio={mediaParams ? mediaParams?.width / mediaParams?.height : imageWidth / imageHeight}
		>
			<FastImage
				source={{uri: imageLink}}
				resizeMode={FastImage.resizeMode.contain}
				onLayout={onLayout}
			/>
		</AspectRatio>
	);
};

export {ResizedImage};
