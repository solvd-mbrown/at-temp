import React, {useRef, useState, useEffect, FC, ReactNode} from 'react';

import {LayoutChangeEvent, Platform, TouchableOpacity, View} from 'react-native';

import ReactNativeZoomableView from '@openspacelabs/react-native-zoomable-view/src/ReactNativeZoomableView';
import {AntDesign, Feather} from '@expo/vector-icons';
import {useNavigation, useTheme} from '@react-navigation/native';
import {Box, Icon, Text} from 'native-base';

import {getTreeInPartsByIdAsync} from '~redux/slices/tree';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';

import styles from './styles';
import {useAppDispatch} from '~hooks/redux';

type ZoomableContainerProps = {
	children: ReactNode;
	initialOffsetX?: number;
	initialOffsetY?: number;
	authUserTreeId?: string;
	authUserId?: string;
};

const ZoomableContainer: FC<ZoomableContainerProps> = ({
	children,
	initialOffsetX,
	initialOffsetY,
	authUserId,
	authUserTreeId,
}) => {
	// eslint-disable-next-line no-undefined
	const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
	// eslint-disable-next-line no-undefined
	const [contentWidth, setContentWidth] = useState<number | undefined>(undefined);
	const dispatch = useAppDispatch();
	const navigation = useNavigation<StackNavigationPropsWithParams<RouteStackList.TipsScreen>>();
	const {colors} = useTheme();

	const zoomableViewRef = useRef<any>();

	!Number.isNaN(initialOffsetX) &&
		!Number.isNaN(initialOffsetY) &&
		// eslint-disable-next-line no-undefined
		initialOffsetX !== undefined &&
		// eslint-disable-next-line no-undefined
		initialOffsetY !== undefined &&
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			zoomableViewRef?.current?.moveTo(initialOffsetX, initialOffsetY);
		}, [initialOffsetX, initialOffsetY]);

	const zoomBy = (zoomValue: number): number => zoomableViewRef?.current?.zoomBy(zoomValue);

	const openTipsModalScreen = (): void => navigation?.navigate(RouteStackList.TipsScreen);

	const refreshTree = (): void => {
		if (authUserTreeId)
			dispatch(getTreeInPartsByIdAsync({treeId: authUserTreeId, userId: authUserId}));
	};

	const onChildrenLayout = (event: LayoutChangeEvent): void => {
		setContentHeight(event.nativeEvent.layout.height);
		setContentWidth(event.nativeEvent.layout.width);
	};

	const increaseZoom = (): number => zoomBy(0.5);
	const decreaseZoom = (): number => zoomBy(-0.5);

	return (
		<Box height="100%" width="100%">
			<ReactNativeZoomableView
				// ref gives wrapper width and height(mb useless), but we need it for moveTo() func and zoom buttons
				ref={zoomableViewRef}
				maxZoom={3}
				minZoom={0.1}
				initialZoom={1}
				doubleTapZoomToCenter
				// styles fro zoomablecontainer, which is inside ReactNativeZoomableView,

				// Give these to the zoomable view so it can apply the boundaries around the actual content.
				// Need to make sure the content is actually centered and the width and height are
				// measured when it's rendered naturally. Not the intrinsic sizes.
				// For example, an image with an intrinsic size of 400x200 will be rendered as 300x150 in this case.
				// Therefore, we'll feed the zoomable view the 300x100 size.

				contentWidth={contentWidth}
				contentHeight={contentHeight}
				panBoundaryPadding={10}
			>
				<Box onLayout={onChildrenLayout}>{children}</Box>
			</ReactNativeZoomableView>
			<Box alignItems="flex-end">
				<View style={[styles.shadowBox, styles.zoomButtons]}>
					<TouchableOpacity onPress={increaseZoom} style={styles.touchArea}>
						<Text fontFamily="Roboto-Regular" style={styles.iconsSize}>
							+
						</Text>
					</TouchableOpacity>
				</View>
				<View style={[styles.shadowBox, styles.zoomButtons, styles.bottomZoomButton]}>
					<TouchableOpacity onPress={decreaseZoom} style={styles.touchArea}>
						<Text fontFamily="Roboto-Regular" style={styles.iconsSize}>
							-
						</Text>
					</TouchableOpacity>
				</View>
			</Box>
			{authUserTreeId && (
				<Box>
					<View style={[styles.shadowBox, styles.refreshButton]}>
						<TouchableOpacity onPress={refreshTree} style={styles.touchArea}>
							<Text paddingTop={Platform.OS === 'ios' ? 0 : 0.5} color={colors.primary}>
								<Icon
									alignSelf="center"
									as={AntDesign}
									name="reload1"
									size={6}
									color={colors.primary}
									marginRight={1}
								/>
							</Text>
						</TouchableOpacity>
					</View>
					<View style={[styles.shadowBox, styles.refreshButton, styles.tipsButton]}>
						<TouchableOpacity onPress={openTipsModalScreen} style={styles.touchArea}>
							<Text color={colors.primary} paddingTop={Platform.OS === 'ios' ? 0 : 0.5}>
								<Icon
									as={Feather}
									name="help-circle"
									size={6}
									color={colors.primary}
									marginRight={1}
								/>
							</Text>
						</TouchableOpacity>
					</View>
				</Box>
			)}
		</Box>
	);
};

export {ZoomableContainer};
