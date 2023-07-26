import React, {useEffect, useLayoutEffect, useCallback, useState, useMemo, FC} from 'react';

import {ListRenderItem} from 'react-native';
import {FlatList} from 'native-base';
import {useDispatch, useSelector} from 'react-redux';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {useTheme} from '@react-navigation/native';

import {updateUserById, userSelector} from '~redux/slices/user';
import {restoreFileUploads} from '~redux/slices/fileUploads';

import {CustomButton, IntroductionListItem} from '~shared';
import {parseStringToJSONdata} from '~utils';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

import styles from './styles';

type IntroductionListItemType = {
	type: 'images' | 'video' | 'text';
	images?: Array<{[key: string]: string}>;
	video?: string | undefined;
	poster?: string | undefined;
	mediaParams?:
		| undefined
		| {
				width: number;
				height: number;
		  };
	text?: string | undefined;
	description?: string | undefined;
	elementIndex: number;
	userId: number;
	sectionType: string;
	videoPoster?: string;
	parsedIntroduction: {
		[key: string]: IntroductionListItemType[];
	};
};

type IntroductionListItemPropsType = {
	[key: string]: IntroductionListItemType[];
};

type OptionsType = {
	[key: string]: {[key: string]: string};
};

type EditIntroductionListScreenProps =
	StackScreenPropsWithParams<RouteStackList.EditIntroductionListScreen>;

const EditIntroductionListScreen: FC<EditIntroductionListScreenProps> = ({route, navigation}) => {
	const {sectionType} = route.params;
	const dispatch = useDispatch();
	const user = useSelector(userSelector.getUser);

	const {colors} = useTheme();

	const introductionTemplate = useMemo(
		() => ({
			intro: [],
			experiences: [],
			other: [],
		}),
		[]
	);

	const [parsedIntroduction, setParsedIntroduction] =
		useState<IntroductionListItemPropsType>(introductionTemplate);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: sectionType.charAt(0).toUpperCase() + sectionType.slice(1),
		});
	}, [navigation, route, sectionType]);

	useEffect(() => {
		dispatch(restoreFileUploads());
	}, [dispatch]);

	const {showActionSheetWithOptions} = useActionSheet();

	useEffect(() => {
		const introduction = user?.data?.introduction;
		if (!introduction || introduction === ' ') {
			dispatch(
				updateUserById({
					userId: user?.data?.id,
					userData: {
						introduction: introductionTemplate,
					},
				})
			);
		} else {
			if (typeof introduction === 'string') {
				const parsedData = parseStringToJSONdata(introduction);
				setParsedIntroduction(parsedData);
			}
		}
	}, [dispatch, introductionTemplate, user?.data?.id, user?.data?.introduction]);

	const handleShowImagePicker = useCallback(
		(type: string) => {
			const options: OptionsType = {
				Text: {type: 'text'},
				Image: {type: 'images'},
				Video: {type: 'video'},
			};
			dispatch(restoreFileUploads());

			navigation.navigate(RouteStackList.EditProfileIntroductionScreen, {
				...options[type],
				parsedIntroduction,
				sectionType,
				userId: user?.data?.id,
			});
		},
		[dispatch, navigation, parsedIntroduction, sectionType, user?.data?.id]
	);

	const onOpenActionSheet = (): void => {
		// customize view android
		dispatch(restoreFileUploads());
		const userInterfaceStyle: 'light' | 'dark' | undefined = 'light';
		const options: Array<string> = ['Text', 'Image', 'Video', 'Cancel'];
		const cancelButtonIndex: number = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			(buttonIndex: number | undefined): void => {
				if (buttonIndex! >= 0 && buttonIndex !== cancelButtonIndex) {
					handleShowImagePicker(options[buttonIndex!]);
				}
			}
		);
	};

	const renderItem: ListRenderItem<IntroductionListItemType> = ({item, index}) => {
		const {type, text, images, video, description, videoPoster, mediaParams} = item;

		return (
			<IntroductionListItem
				parsedIntroduction={parsedIntroduction}
				sectionType={sectionType}
				elementIndex={index}
				userId={user?.data?.id}
				type={type}
				images={images}
				video={video}
				poster={videoPoster}
				text={text}
				mediaParams={mediaParams}
				description={description}
			/>
		);
	};

	const footer: FC = () => {
		return (
			<CustomButton
				onPress={onOpenActionSheet}
				title="Add new item"
				marginTop={30}
				isBordered
				textColor={colors.primary}
			/>
		);
	};

	return (
		<>
			<FlatList
				paddingBottom={10}
				paddingX={5}
				borderWidth={1}
				zIndex={0}
				showsVerticalScrollIndicator={false}
				data={parsedIntroduction[sectionType]}
				keyExtractor={(item, index) => item.type + index}
				renderItem={renderItem}
				ListFooterComponent={footer}
				ListFooterComponentStyle={styles.footerContainer}
			/>
		</>
	);
};

export default EditIntroductionListScreen;
