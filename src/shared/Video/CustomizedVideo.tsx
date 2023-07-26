import React, {forwardRef, useState, Dispatch, SetStateAction, useCallback} from 'react';

import {Platform, TouchableWithoutFeedback} from 'react-native';

import {Video as ExpoVideo, AVPlaybackStatus, ResizeMode, VideoReadyForDisplayEvent} from 'expo-av';
import Video, {OnLoadData} from 'react-native-video';
import {AspectRatio, Box, Icon} from 'native-base';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import VideoStyles from './VideoStyles';

type Props = {
	videoUri: string | null;
	isPlaying: boolean;
	setIsPlaying: (isPlaying: boolean) => void;
	currentVideo: string | null;
	setCurrentVideo: ((currentVideo: string | null) => void) | Dispatch<SetStateAction<null>>;
	setVideoStatus?: (status: AVPlaybackStatus) => void;
	ratio?: number;
};

const CustomizedVideo = forwardRef<any, Props>(
	(
		{videoUri, isPlaying, setIsPlaying, currentVideo, setCurrentVideo, setVideoStatus, ratio},
		ref
	) => {
		const [showPlayControl, setShowPlayControl] = useState<boolean>(true);
		const [videoWidth, setVideoWidth] = useState<number>(1);
		const [videoHeight, setVideoHeight] = useState<number>(1);

		const onVideoPress = (): void => {
			// @ts-ignore
			setCurrentVideo(videoUri);
			setIsPlaying(true);
		};

		const onLoad = useCallback(
			({naturalSize: {width, height, orientation}}: OnLoadData): void => {
				!ratio && setVideoWidth(orientation === 'landscape' ? width : height);
				!ratio && setVideoHeight(orientation === 'landscape' ? height : width);
			},
			[ratio]
		);

		const onPlaybackStatusUpdate = useCallback(
			(status: AVPlaybackStatus): void => {
				setVideoStatus && setVideoStatus(status);
				if (status.isLoaded && status?.didJustFinish) {
					// @ts-ignore
					if (ref?.current) {
						// @ts-ignore
						ref.current.setStatusAsync({
							shouldPlay: false,
						});
						setShowPlayControl(true);
					}
				}
			},
			[ref, setVideoStatus]
		);

		const onReadyForDisplay = useCallback(
			({naturalSize: {width, height}}: VideoReadyForDisplayEvent) => {
				!ratio && setVideoWidth(width);
				!ratio && setVideoHeight(height);
			},
			[ratio]
		);

		const onControlPress = useCallback(() => {
			setShowPlayControl(false);
			if (Platform.OS === 'ios') {
				// @ts-ignore
				if (ref?.current) {
					// @ts-ignore
					ref?.current?.setNativeProps({paused: false});
				}
			} else {
				// @ts-ignore
				ref?.current?.setStatusAsync({
					shouldPlay: true,
				});
			}
		}, [ref]);

		const onEnd = useCallback(() => {
			// @ts-ignore
			ref?.current?.setNativeProps({paused: true});
			// @ts-ignore
			ref?.current?.seek(0);
			setShowPlayControl(true);
		}, [ref]);

		const isPaused = videoUri !== currentVideo ? true : !isPlaying;

		return (
			<>
				<AspectRatio w="100%" position="relative" ratio={ratio ? ratio : videoWidth / videoHeight}>
					<TouchableWithoutFeedback onPress={onVideoPress}>
						{Platform.OS === 'ios' ? (
							<Video
								// @ts-ignore
								source={{uri: videoUri}}
								// @ts-ignore
								ref={(videoRef: Video | null): Video | null => (ref.current = videoRef)}
								style={VideoStyles.video}
								volume={1.0}
								muted={false}
								ignoreSilentSwitch="ignore"
								controls={!showPlayControl}
								resizeMode="cover"
								fullscreenAutorotate
								paused={isPaused}
								onLoad={onLoad}
								onEnd={onEnd}
								playInBackground={false}
							/>
						) : (
							<ExpoVideo
								ref={ref}
								style={VideoStyles.video}
								source={{
									// @ts-ignore
									uri: videoUri,
								}}
								shouldPlay={!isPaused}
								useNativeControls={videoUri === currentVideo}
								resizeMode={ResizeMode.CONTAIN}
								isLooping={true}
								onPlaybackStatusUpdate={onPlaybackStatusUpdate}
								onReadyForDisplay={onReadyForDisplay}
							/>
						)}
					</TouchableWithoutFeedback>
				</AspectRatio>
				{showPlayControl && (
					<TouchableWithoutFeedback style={VideoStyles.playPressArea} onPress={onControlPress}>
						<Box style={VideoStyles.playControlContainer}>
							<Icon as={FontAwesome5} name="play" size={45} color="white" />
						</Box>
					</TouchableWithoutFeedback>
				)}
			</>
		);
	}
);

CustomizedVideo.displayName = 'CustomizedVideo';

export {CustomizedVideo};
