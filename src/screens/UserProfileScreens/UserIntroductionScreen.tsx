import React, {useEffect, useState, useRef} from 'react';

import {ScrollView, Text, FlatList, VStack, Box} from 'native-base';
import {useSelector} from 'react-redux';

import {userSelector} from '~redux/slices/user';
import {parseStringToJSONdata} from '~utils';
import {CustomizedVideo} from '~shared';
import {ResizedImage} from '~shared/ResizedImage/ResizedImage';
import {ListRenderItem} from 'react-native';

type IntroductionListItemType = {
	type: 'images' | 'video' | 'text';
	images: Array<{[key: string]: string}>;
	video?: string | undefined;
	poster?: string | undefined;
	mediaParams?: {
		width: number;
		height: number;
	};
	text?: string | undefined;
	description?: string | undefined;
	elementIndex: number;
	userId: string;
	sectionType: string;
	videoPoster?: string;
	length?: number | undefined;
};

type IntroductionItemType = [first: string, ...rest: IntroductionListItemType[]];

const UserIntroductionScreen = () => {
	// @ts-ignore
	const user = useSelector(userSelector.getUser);
	const videoRef = useRef(null);

	const userData = user?.data;

	const [introduction, setIntroduction] = useState<
		IntroductionItemType[] | [string, unknown][] | null
	>(null);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [currentVideo, setCurrentVideo] = useState(null);

	useEffect(() => {
		if (userData?.introduction) {
			const preparedData = Object.entries(parseStringToJSONdata(userData?.introduction));
			setIntroduction(preparedData);
		}
	}, [userData]);

	const renderItemSecondLevel: ListRenderItem<IntroductionListItemType> = ({item}): any => {
		if (item.text) {
			return (
				<Text
					fontFamily="Roboto-Regular"
					fontStyle="normal"
					fontWeight={400}
					fontSize={14}
					lineHeight={20}
					mb={5}
				>
					{item.text}
				</Text>
			);
		}
		if (item?.images?.length > 0) {
			return (
				<Box mb={6}>
					<ResizedImage imageLink={item?.images[0]?.imageLink} mediaParams={item?.mediaParams} />

					{item?.description && (
						<Text
							fontFamily="Roboto-Regular"
							fontStyle="normal"
							fontWeight={400}
							fontSize={14}
							lineHeight={20}
						>
							{item?.description}
						</Text>
					)}
				</Box>
			);
		}
		if (item?.video) {
			return (
				<Box mb={6}>
					{/* <AspectRatio w="100%" ratio={videoWidth / videoHeight}> */}
					<CustomizedVideo
						ref={videoRef}
						ratio={item?.mediaParams?.width! / item?.mediaParams?.height!}
						videoUri={item?.video}
						isPlaying={isVideoPlaying}
						setIsPlaying={setIsVideoPlaying}
						currentVideo={currentVideo}
						setCurrentVideo={setCurrentVideo}
						// setVideoWidth={setVideoWidth}
						// setVideoHeight={setVideoHeight}
					/>
					{/* </AspectRatio> */}
					{item?.description && (
						<Text
							fontFamily="Roboto-Regular"
							fontStyle="normal"
							fontWeight={400}
							fontSize={14}
							lineHeight={20}
							mt={2}
						>
							{item?.description}
						</Text>
					)}
				</Box>
			);
		}
	};

	const renderItemFirstLevel: ListRenderItem<IntroductionItemType> = ({item}): any => {
		if (item![0] && item[1]?.length! > 0) {
			return (
				<>
					<Text fontSize={21} mb={2} lineHeight={20}>
						{item![0].charAt(0).toUpperCase() + item![0].slice(1)}
					</Text>
					<FlatList
						showsVerticalScrollIndicator={false}
						// @ts-ignore
						data={item[1] as IntroductionListItemType}
						keyExtractor={item => item?.video || item?.text || item?.images[0]?.imageLink}
						renderItem={renderItemSecondLevel}
					/>
				</>
			);
		}
	};

	return (
		<ScrollView paddingY={8} bg={'white'}>
			<VStack paddingBottom={8}>
				<Text
					fontFamily="Roboto-Regular"
					fontStyle="normal"
					fontWeight={500}
					fontSize={24}
					lineHeight={28}
					paddingX={4}
					mb={4}
				>
					{(userData?.firstName || '') +
						(userData?.maidenName ? ` (${userData?.maidenName})` : '') +
						(userData?.lastName ? ` ${userData?.lastName}` : '')}
				</Text>
				{userData?.introduction && (
					<FlatList
						paddingY={2}
						paddingX={4}
						showsVerticalScrollIndicator={false}
						data={introduction as IntroductionItemType[]}
						// onEndReachedThreshold={0}
						// onEndReached={handleOnEndReached}
						keyExtractor={item => item![0]}
						renderItem={renderItemFirstLevel}
					/>
				)}
			</VStack>
		</ScrollView>
	);
};

export default UserIntroductionScreen;
