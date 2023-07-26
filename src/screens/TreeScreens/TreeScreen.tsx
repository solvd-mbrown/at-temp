import React, {useEffect, useState, useCallback, FC} from 'react';

import {
	ActivityIndicator,
	LayoutChangeEvent,
	TouchableOpacity,
	useWindowDimensions,
} from 'react-native';

import {HStack, Text, VStack, Box} from 'native-base';
import {useSelector} from 'react-redux';
import Svg, {Line} from 'react-native-svg';
import FastImage from 'react-native-fast-image';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {useFocusEffect} from '@react-navigation/native';
import Orientation, {useDeviceOrientationChange} from 'react-native-orientation-locker';
import {scale} from 'react-native-utils-scale';
import Spinner from 'react-native-loading-spinner-overlay/lib';
import {StackScreenProps} from '@react-navigation/stack';

import {authSelector, saveAuthUser} from '~redux/slices/auth';
import {
	getTreeInPartsByIdAsync,
	setTreeViewer,
	treeSelector,
	updateTreeByIdAsync,
} from '~redux/slices/tree';
import {
	deleteUserById,
	getSpouseByIdAsync,
	getUserByIdAsync,
	hideSpouseActionSheet,
	resetNewUserData,
	resetSpouseData,
	userSelector,
} from '~redux/slices/user';

import {ZoomableContainer} from '~shared';
import {TreeTypes, TreeMemberActionSheetOptions} from '~utils';
import {noGenderAvatarImage} from '~images';
import {RootTabParamList} from '~navigation/TabNavigator';

import {ITreeMemberDescendant} from '~interfaces/ITreeMemberDescendant';
import {IRelative} from '~interfaces/IRelative';
import {IUser} from '~interfaces/IUser';
import {TreePart} from '~types/TreePart';
import {AddRelativesActionSheetOptions} from '~types/AddRelativesActionSheetOptions';

import AddUserToTreeModal from './components/AddUserToTreeModal';
import treeStyles from './treeStyles';

import navigateToUserProfile from './Helpers/NavigationHelper';
import {
	isRootMember,
	hasChildren,
	isMarried,
	isDescendantOrSpouse,
	isParentLineDuplication,
	renderDescendantNameDependingOnGender,
	renderDescendantAvatarDependingOnGender,
	renderSpouseNameDependingOnGender,
	renderSpouseAvatarDependingOnGender,
	isMotherOfRootTreeMember,
	shouldRenderSubTree,
	shouldRenderRootTree,
	shouldSwapSubTreeAndRootTree,
	isSpouseOfAuthUser,
} from './Helpers/RenderTreeMembersHelpers';
import {
	getRootTreeMemberActionSheetOptions,
	getDefaultTreeMemberOptions,
	getTreeMemberSpouseOptions,
	getFinalTreeMemberOptions,
} from './Helpers/ActionSheetHelpers';
import {
	getVerticalTopLineColorOfTreeMember,
	getHorizontalLinesFromTopTreesToMainTree,
	getTopHorizontalLineOfSpouse,
	getTopHorizontalLineOfDescendant,
} from './Helpers/RenderTreeLinesHelpers';
import {swapWidthAndHeightInPlaces} from './Helpers/TopTreesRenderHelpers';
import {
	getDescendantIDDependingOnGender,
	getSpouseIDDependingOnGender,
} from './Helpers/GetTreeMemberIdHelpers';
import {renderChildren} from './Helpers/RenderChildren';
import {getGetTreeInPartsByIdAsyncUserIdOfAuthUserTreeParamHelper} from './Helpers/GetRequestsParamsHelpers';
import {useAppDispatch} from '~hooks/redux';
import {DynamicLinksHelper} from '~services/dynamicLinks.helper';

type TreeScreenProps = StackScreenProps<RootTabParamList, 'tree'>;

const siblingGap = 3;
const nodeTitleColor = '#252A31';
const pathColor = '#E4E4E4';
const strokeWidth = 3;

const TreeScreen: FC<TreeScreenProps> = ({navigation}) => {
	const {nodeStyle, nodeTitleStyle, imageStyle} = treeStyles;

	const dispatch = useAppDispatch();

	const authUser = useSelector(authSelector.getAuthUser);

	const tree = useSelector(treeSelector.getTree);
	const treeLoading = useSelector(treeSelector.getTreeLoading);
	const user = useSelector(userSelector.getUser);
	const spouseLoading = useSelector(userSelector.getSpouseLoading);

	const [isScreenFocused, setIsScreenFocused] = useState(false);

	useFocusEffect(
		// @ts-ignore
		// eslint-disable-next-line react-hooks/exhaustive-deps
		useCallback(() => {
			setIsScreenFocused(true);
			return () => {
				setIsScreenFocused(false);
			};
		})
	);

	useDeviceOrientationChange(() => {
		Orientation.getAutoRotateState(rotationEnabled => {
			isScreenFocused && rotationEnabled
				? Orientation.unlockAllOrientations()
				: Orientation.lockToPortrait();
		});
	});

	const getAuthUser = useCallback(async () => {
		if (authUser?.data?.id) {
			const authUserResponse = await dispatch(getUserByIdAsync(authUser?.data?.id));
			if (authUserResponse) {
				dispatch(saveAuthUser({...authUserResponse.payload, isInitialFetchFinished: true}));
			}
		}
	}, [authUser.data?.id, dispatch]);

	useEffect(() => {
		getAuthUser();
	}, [getAuthUser]);

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const [selectedUserId, setSelectedUserId] = useState<string>('');

	const [selectedTreeMemberThatHoldsChildren, setSelectedTreeMemberThatHoldsChildren] =
		useState<ITreeMemberDescendant | null>();

	// * Relation in Tree. Could be either — DESCENDANT || MARRIED || MARRIEDSUBTREE. Using for adding user into tree
	const [newUserRoleInTheTreeForSelectedUser, setNewUserRoleInTheTreeForSelectedUser] =
		useState<TreeMemberActionSheetOptions>(TreeMemberActionSheetOptions.AddChild);

	const [initialOffsetY, setInitialOffsetY] = useState(0);
	const [containerHeight, setContainerHeight] = useState(0);

	useEffect(() => {
		if (
			user.data?.id &&
			authUser.data?.id &&
			authUser.data?.myTreeIdByParent1 &&
			authUser.data?.isInitialFetchFinished
		) {
			if (user?.recentlyDeletedUserId) {
				dispatch(
					getTreeInPartsByIdAsync({
						treeId: tree?.data?.id,
						userId:
							tree?.data?.bottomPartTree[0]?.descendant?.length > 0 &&
							user?.recentlyDeletedUserId !==
								tree?.data?.bottomPartTree[0]?.descendant[0]?.user?.identity
								? tree?.data?.bottomPartTree[0]?.descendant[0]?.user?.identity
								: tree?.data?.bottomPartTree[0]?.user?.identity,
					})
				);
			} else {
				if (
					tree?.data?.id &&
					tree?.data?.id !== authUser?.data?.myTreeIdByParent1 &&
					tree?.treeViewer
				) {
					dispatch(getTreeInPartsByIdAsync({treeId: tree?.data?.id, userId: tree?.treeViewer}));
				} else {
					dispatch(
						getTreeInPartsByIdAsync({
							treeId: authUser?.data?.myTreeIdByParent1,
							userId: getGetTreeInPartsByIdAsyncUserIdOfAuthUserTreeParamHelper(
								tree.data?.bottomPartTree
									? tree.data?.bottomPartTree[0]?.user?.identity
									: authUser?.data?.id,
								authUser?.data?.id,
								newUserRoleInTheTreeForSelectedUser,
								tree.data?.bottomPartTree && tree.data?.bottomPartTree[0]?.descendant?.length > 0,
								tree.data?.bottomPartTree &&
									tree.data?.bottomPartTree[0]?.descendant[0]?.user?.identity
							),
						})
					);
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		dispatch,
		authUser?.data?.myTreeIdByParent1,
		tree?.newUserJoinedId,
		user?.recentlyDeletedUserId,
		authUser?.data?.isInitialFetchFinished,
	]);

	// Joining new user to tree
	useEffect(() => {
		if (user?.newUserData?.id && selectedUserId) {
			dispatch(
				updateTreeByIdAsync({
					treeId: tree?.data?.id,
					toUserId: selectedUserId,
					newUserId: user?.newUserData?.id,
					roleType: newUserRoleInTheTreeForSelectedUser,
					isRootUser: isRootMember(selectedUserId, tree?.data?.bottomPartTree[0]?.user?.identity),
					isWifeOfRootUser: selectedUserId === tree?.data?.bottomPartTree[0]?.married[0]?.identity,
					treeMemberThatHoldsChildren: selectedTreeMemberThatHoldsChildren, //* not empty if spouse case
				})
			);
			dispatch(resetNewUserData());
			setIsModalVisible(false);
			setSelectedTreeMemberThatHoldsChildren(null);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, user?.newUserData]);

	const {width, height} = useWindowDimensions();
	const {showActionSheetWithOptions} = useActionSheet();

	const isDeleteMemberTree = (
		isUserHasChildren: boolean,
		getSpouseDataResponse: boolean,
		isRoot: boolean,
		userSpouses: IRelative[]
	) =>
		(!isRoot && !getSpouseDataResponse && !isUserHasChildren) ||
		!userSpouses?.length ||
		(!isUserHasChildren && !getSpouseDataResponse);

	const onOpenActionSheet = (
		userId: string,
		userSpouses: IRelative[],
		isUserHasChildren: boolean,
		isSpouse: boolean,
		memberItem: ITreeMemberDescendant | IRelative,
		// always member with item?.user property (actually husband)
		// Need it only in spouse case
		descendantLineItem: ITreeMemberDescendant,
		treeType: TreeTypes,
		spouseDataResponse?: IUser,
		firstName?: string,
		lastName?: string,
		isActivated = false
	) => {
		// customize view android
		const userInterfaceStyle: 'light' | 'dark' | undefined = 'light';

		// Basic options — depends on user role root/not root
		const basicOptions: AddRelativesActionSheetOptions = isRootMember(
			userId,
			tree?.data?.[treeType][0]?.user?.identity
		)
			? getRootTreeMemberActionSheetOptions(treeType, userSpouses, tree?.data?.rootPartTree)
			: getDefaultTreeMemberOptions(treeType, userSpouses);
		// Final options — depends on basic options and if user has no children (user with no children could bee deleted)

		const isSpouseDataResponse = spouseDataResponse?.parents
			? spouseDataResponse?.parents?.length > 0
			: false;
		const isAuth = authUser.data?.id === userId;

		const options: AddRelativesActionSheetOptions = isSpouse
			? getTreeMemberSpouseOptions(isUserHasChildren, treeType, isSpouseDataResponse)
			: getFinalTreeMemberOptions(
					isUserHasChildren,
					basicOptions,
					isAuth,
					isRootMember(userId, tree?.data?.[treeType][0]?.user?.identity),
					userSpouses
			  );

		if (!isAuth && !isActivated) {
			options.push(TreeMemberActionSheetOptions.Invite);
		}

		if (!isAuth) {
			isDeleteMemberTree(
				isUserHasChildren,
				isSpouseDataResponse,
				isRootMember(userId, tree?.data?.[treeType][0]?.user?.identity),
				userSpouses
			) && options.push(TreeMemberActionSheetOptions.DeleteTreeMember);
		}

		options.push('Cancel');

		// Specific ActionSheet buttons index
		const cancelButtonIndex: number = options.findIndex(element => element === 'Cancel');
		const destructiveButtonIndex: number = options.findIndex(
			element => element === TreeMemberActionSheetOptions.DeleteTreeMember
		);
		const gotToUserTreeButtonIndex: number = options.findIndex(
			element => element === TreeMemberActionSheetOptions.ViewMembersTree
		);

		const indexOfInvite = options.findIndex(
			element => element === TreeMemberActionSheetOptions.Invite
		);

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				destructiveButtonIndex,
				userInterfaceStyle,
				useModal: true,
			},
			(buttonIndex: number | undefined): void | Promise<void> => {
				if (buttonIndex === indexOfInvite) {
					DynamicLinksHelper.onInvitePress({
						firstName: authUser?.data?.firstName,
						lastName: authUser?.data?.lastName,
						invitedUserName: `${firstName} ${lastName}`,
						invitedUserId: userId,
					});
				}

				if (isSpouse && !isSpouseOfAuthUser(descendantLineItem.user.identity, authUser?.data?.id)) {
					dispatch(setTreeViewer(descendantLineItem.user.identity));
				} else {
					dispatch(setTreeViewer(userId));
				}
				if (
					buttonIndex !== gotToUserTreeButtonIndex &&
					buttonIndex !== destructiveButtonIndex &&
					buttonIndex !== cancelButtonIndex &&
					buttonIndex !== indexOfInvite
				) {
					// * Above condition exclude wrong type.
					// @ts-ignore
					setNewUserRoleInTheTreeForSelectedUser(options[buttonIndex as number]);
					setIsModalVisible(true);
					if (isSpouse) {
						setSelectedTreeMemberThatHoldsChildren(descendantLineItem);
					}
				} else {
					if (
						buttonIndex === destructiveButtonIndex &&
						buttonIndex !== gotToUserTreeButtonIndex &&
						buttonIndex !== cancelButtonIndex
					) {
						dispatch(deleteUserById(userId));
					}
					if (
						buttonIndex === gotToUserTreeButtonIndex &&
						buttonIndex !== destructiveButtonIndex &&
						buttonIndex !== cancelButtonIndex
					) {
						if (treeType === TreeTypes.MotherAncestryTreeLine) {
							// mother us auth user
							const subTreeOwner = tree?.data?.bottomPartTree[0]?.married[0];
							dispatch(
								getTreeInPartsByIdAsync({
									treeId:
										// TODO add type in interface for properties
										// @ts-ignore
										memberItem?.properties?.myTreeIdByParent1 ||
										subTreeOwner?.properties?.myTreeIdByParent1 ||
										authUser?.data?.myTreeIdByParent1,
									userId,
								})
							);
						} else {
							dispatch(
								getTreeInPartsByIdAsync({
									treeId:
										// TODO add type in interface for properties
										// @ts-ignore
										memberItem?.properties?.myTreeIdByParent1 || authUser?.data?.myTreeIdByParent1,
									userId,
								})
							);
						}
						// dispatch(setTreeViewer(userId));
						setSelectedUserId('');
						dispatch(resetSpouseData());
						dispatch(hideSpouseActionSheet());
					}
					if (buttonIndex === cancelButtonIndex) {
						setIsModalVisible(false);
					}
				}
			}
		);
	};

	const onTreeMemberPress =
		(isDescendant: boolean, treeMemberIdentity: string, spouseIdentity: string): (() => void) =>
		(): void => {
			if (isDescendant) {
				navigateToUserProfile(treeMemberIdentity, navigation);
			} else {
				navigateToUserProfile(spouseIdentity, navigation);
			}
		};

	const onDescendantLongPress =
		(isDescendant: boolean, item: ITreeMemberDescendant, treeType: TreeTypes) => async () => {
			if (isDescendant) {
				setSelectedUserId(item.user.identity);
				onOpenActionSheet(
					item.user.identity,
					item.married,
					hasChildren(item),
					false,
					item,
					item,
					treeType,
					false,
					item.user.properties.firstName,
					item.user.properties.lastName,
					item.user.properties.isActivated
				);
			} else {
				try {
					const spouseResponse = await dispatch(
						// TODO redux types
						// @ts-ignore
						getSpouseByIdAsync(item?.married[0]?.identity)
					);
					if (spouseResponse) {
						const {firstName, lastName, isActivated} = spouseResponse.payload;
						setSelectedUserId(item?.married[0]?.identity);
						onOpenActionSheet(
							item?.married[0]?.identity,
							item?.married,
							hasChildren(item),
							true,
							item?.married[0],
							item,
							treeType,
							spouseResponse.payload,
							firstName,
							lastName,
							isActivated
						);
					}
				} catch (error) {
					console.log('catch 1 error :>> ', error);
				}
			}
		};

	const onSpouseLongPress =
		(
			isDescendant: boolean,
			descendantLineItem: ITreeMemberDescendant,
			spouse: IRelative,
			treeType: TreeTypes
		): (() => void) =>
		async (): Promise<void> => {
			if (isDescendant) {
				try {
					const spouseResponse = await dispatch(
						getSpouseByIdAsync(descendantLineItem?.married[0]?.identity)
					);

					if (spouseResponse) {
						const {firstName, lastName, isActivated} = spouseResponse.payload;
						setSelectedUserId(spouse.identity);
						onOpenActionSheet(
							spouse.identity,
							descendantLineItem.married,
							hasChildren(descendantLineItem),
							true,
							spouse,
							descendantLineItem,
							treeType,
							spouseResponse.payload,
							firstName,
							lastName,
							isActivated
						);
					}
				} catch (error) {
					console.log('catch 2 error :>> ', error);
				}
			} else {
				setSelectedUserId(descendantLineItem.user.identity);
				onOpenActionSheet(
					descendantLineItem.user.identity,
					descendantLineItem.married,
					hasChildren(descendantLineItem),
					false,
					descendantLineItem,
					descendantLineItem,
					treeType,
					false,
					descendantLineItem.user.properties.firstName,
					descendantLineItem.user.properties.lastName,
					descendantLineItem.user.properties.isActivated
				);
			}
		};

	const onBottomTreeLayout = (event: LayoutChangeEvent): void => {
		setInitialOffsetY(event.nativeEvent?.layout?.y);
		setContainerHeight(event.nativeEvent?.layout?.height);
	};

	const renderTree = (
		data: TreePart,
		treeType: TreeTypes = TreeTypes.MainTree,
		level: number,
		parentIdentity?: string
	) => {
		let rootGrandParent: ITreeMemberDescendant;
		let subGrandParent: ITreeMemberDescendant;

		//Cutting top parents trees on the level of grandparents
		if (treeType === TreeTypes.FatherAncestryTreeLine && level === 1) {
			const retrieveRootGrandParent = (treeMember: ITreeMemberDescendant): void => {
				// eslint-disable-next-line no-undefined
				if (rootGrandParent !== undefined) return;

				treeMember.descendant?.forEach(child => {
					if (
						(child as ITreeMemberDescendant)?.user?.identity === parentIdentity ||
						(child as IRelative)?.identity === parentIdentity
					)
						rootGrandParent = treeMember;
					else retrieveRootGrandParent(child as ITreeMemberDescendant);
				});
			};

			if (data?.length > 0) retrieveRootGrandParent(data[0]);
			// @ts-ignore
			data = [rootGrandParent];
			level = -2;
		}

		if (treeType === TreeTypes.MotherAncestryTreeLine && level === 1) {
			const retrieveRootGrandParent = (treeMember: ITreeMemberDescendant): void => {
				// eslint-disable-next-line no-undefined
				if (subGrandParent !== undefined) return;

				treeMember.descendant?.forEach(child => {
					if (
						(child as ITreeMemberDescendant)?.user?.identity === parentIdentity ||
						(child as IRelative)?.identity === parentIdentity
					)
						subGrandParent = treeMember;
					else retrieveRootGrandParent(child as ITreeMemberDescendant);
				});
			};

			if (data?.length > 0) retrieveRootGrandParent(data[0]);
			// @ts-ignore
			data = [subGrandParent];
			level = -2;
		}

		return data?.map((item: ITreeMemberDescendant, index: number) => {
			if (
				item?.user && // * One user in TreeTypes.FatherAncestryTreeLine is broken and it is father's clone of loggedIn user
				!isMotherOfRootTreeMember(
					tree?.data?.bottomPartTree[0]?.married[0]?.identity,
					item?.user?.identity
				)
			) {
				return (
					<HStack
						key={`${item?.user?.properties?.firstName} + ${item?.user?.properties?.lastName} + ${item?.user?.identity} + ${index} + ${level}`}
						style={treeStyles.mainContainer}
					>
						<Box alignItems="center" paddingLeft={siblingGap / 2} paddingRight={siblingGap / 2}>
							<HStack alignItems="flex-start">
								<VStack alignItems="center">
									{
										// Top Line from blood child
										<Svg height="25" width="100%">
											{!rootGrandParent && (
												<Line
													x1="50%"
													y1="0"
													x2="50%"
													y2="100%"
													stroke={getVerticalTopLineColorOfTreeMember(
														isRootMember(
															item?.user?.identity,
															tree?.data?.[treeType][0]?.user?.identity
														),
														shouldSwapSubTreeAndRootTree(tree?.data?.bottomPartTree[0]),
														shouldRenderRootTree(tree?.data?.rootPartTree),
														shouldRenderSubTree(
															tree?.data?.bottomPartTree[0]?.married[0]?.identity,
															tree?.data?.subTree?.length > 0
																? tree?.data?.subTree[0]?.enterPointToSubTree[0]?.identity
																: null
														),
														isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item)),
														false,
														treeType,
														isSpouseOfAuthUser(item?.user?.identity, authUser.data?.id),
														pathColor
													)}
													strokeWidth={strokeWidth}
												/>
											)}
											<Svg>
												{
													// Horizontal line
													getTopHorizontalLineOfDescendant(
														isRootMember(
															item?.user?.identity,
															tree?.data?.[treeType][0]?.user?.identity
														),
														isMarried(item),
														isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item)),
														treeType,
														strokeWidth,
														pathColor,
														shouldSwapSubTreeAndRootTree(tree?.data?.bottomPartTree[0]),
														shouldRenderRootTree(tree?.data?.rootPartTree),
														shouldRenderSubTree(
															tree?.data?.bottomPartTree[0]?.married[0]?.identity,
															tree?.data?.subTree?.length > 0
																? tree?.data?.subTree[0]?.enterPointToSubTree[0]?.identity
																: null
														),
														isSpouseOfAuthUser(item?.user?.identity, authUser.data?.id)
													)
												}
											</Svg>
										</Svg>
									}

									<TouchableOpacity
										onPress={onTreeMemberPress(
											isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item)),
											item.user.identity,
											item?.married[0]?.identity
										)}
										onLongPress={onDescendantLongPress(
											isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item)),
											item,
											treeType
										)}
										style={nodeStyle}
									>
										<FastImage
											source={
												renderDescendantAvatarDependingOnGender(item)
													? {
															uri: renderDescendantAvatarDependingOnGender(item),
													  }
													: noGenderAvatarImage
											}
											resizeMode={FastImage.resizeMode.cover}
											style={imageStyle}
										/>
										<Text
											numberOfLines={1}
											fontFamily="Roboto-Regular"
											color={nodeTitleColor}
											style={nodeTitleStyle}
										>
											{renderDescendantNameDependingOnGender(item)}
										</Text>
									</TouchableOpacity>
								</VStack>

								<VStack>
									{
										// *NOTE: Additional (small) line for blood child. Need it outside of container to make solid line
										isMarried(item) && (
											<Box
												//* if blood descendant user is on right side in the pair — flex-start, if if blood descendant user is on left side in the pair — flex-end
												alignSelf={
													isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item))
														? 'flex-start'
														: 'flex-end'
												}
											>
												<Svg height="53" width="14">
													<Line
														x1="100%"
														y1={strokeWidth / 2}
														x2="0"
														y2={strokeWidth / 2}
														stroke={
															!rootGrandParent && // Could be removed
															!isRootMember(
																item?.user?.identity,
																tree?.data?.[treeType][0]?.user?.identity
															)
																? pathColor
																: 'white'
														}
														strokeWidth={strokeWidth}
													/>
												</Svg>
											</Box>
										)
									}

									{
										// Line between spouses
										isMarried(item) && (
											<Box marginTop={3} alignItems="flex-end">
												{/* Gaps between vertical lines can be fix here */}
												<Svg height="85" width="25">
													{/* Horizontal line */}
													<Line
														x1="100%"
														y1={strokeWidth / 2}
														x2="0"
														y2={strokeWidth / 2}
														stroke={pathColor}
														strokeWidth={strokeWidth}
													/>
													{hasChildren(item) && (
														<Line
															x1="50%"
															y1="0"
															x2="50%"
															y2="100%"
															stroke={pathColor}
															strokeWidth={strokeWidth}
														/>
													)}
												</Svg>
											</Box>
										)
									}
								</VStack>

								{
									// Spouse
									isMarried(item) &&
										item.married.map((spouse, spouseIndex) => {
											return (
												<VStack
													key={`
                            ${spouse?.properties?.firstName} +
                            ${spouse?.properties?.lastName} +
                            ${spouse?.identity} +
                            ${spouseIndex} +
                            ${level}
                            `}
												>
													{
														// (Spouse) Left user in pair (Was left before, now — left if woman)
														<Svg height="25" width="100%">
															{/* Top vertical line */}
															<Line
																x1="50%"
																y1="0"
																x2="50%"
																y2="100%"
																stroke={getVerticalTopLineColorOfTreeMember(
																	isRootMember(
																		item?.user?.identity,
																		tree?.data?.[treeType][0]?.user?.identity
																	),
																	shouldSwapSubTreeAndRootTree(tree?.data?.bottomPartTree[0]),
																	shouldRenderRootTree(tree?.data?.rootPartTree),
																	shouldRenderSubTree(
																		tree?.data?.bottomPartTree[0]?.married[0]?.identity,
																		tree?.data?.subTree?.length > 0
																			? tree?.data?.subTree[0]?.enterPointToSubTree[0]?.identity
																			: null
																	),
																	isDescendantOrSpouse(
																		item,
																		getSpouseIDDependingOnGender(spouse, item)
																	),
																	true,
																	treeType,
																	isSpouseOfAuthUser(item?.user?.identity, authUser.data?.id),
																	pathColor
																)}
																strokeWidth={strokeWidth}
															/>
															{
																// Horizontal line
																getTopHorizontalLineOfSpouse(
																	isRootMember(
																		item?.user?.identity,
																		tree?.data?.[treeType][0]?.user?.identity
																	),
																	isDescendantOrSpouse(
																		item,
																		getSpouseIDDependingOnGender(spouse, item)
																	),
																	treeType,
																	strokeWidth,
																	pathColor,
																	shouldSwapSubTreeAndRootTree(tree?.data?.bottomPartTree[0]),
																	shouldRenderRootTree(tree?.data?.rootPartTree),
																	shouldRenderSubTree(
																		tree?.data?.bottomPartTree[0]?.married[0]?.identity,
																		tree?.data?.subTree?.length > 0
																			? tree?.data?.subTree[0]?.enterPointToSubTree[0]?.identity
																			: null
																	),
																	isSpouseOfAuthUser(item?.user?.identity, authUser.data?.id)
																)
															}
														</Svg>
													}
													<TouchableOpacity
														onPress={onTreeMemberPress(
															isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item)),
															spouse.identity,
															item.user.identity
														)}
														onLongPress={onSpouseLongPress(
															isDescendantOrSpouse(item, getDescendantIDDependingOnGender(item)),
															item,
															spouse,
															treeType
														)}
														style={nodeStyle}
													>
														<FastImage
															source={
																renderSpouseAvatarDependingOnGender(spouse, item)
																	? {
																			uri: renderSpouseAvatarDependingOnGender(spouse, item),
																	  }
																	: noGenderAvatarImage
															}
															resizeMode={FastImage.resizeMode.cover}
															style={imageStyle}
														/>
														<Text
															numberOfLines={1}
															fontFamily="Roboto-Regular"
															color={nodeTitleColor}
															style={nodeTitleStyle}
														>
															{renderSpouseNameDependingOnGender(spouse, item)}
														</Text>
													</TouchableOpacity>
												</VStack>
											);
										})
								}
							</HStack>

							{
								// Bottom vertical line — from parent to horizontal line

								treeType === TreeTypes.FatherAncestryTreeLine ||
								treeType === TreeTypes.MotherAncestryTreeLine ? (
									isMarried(item) ? (
										<Box
											justifyContent="center"
											alignItems="center"
											width={
												// this case is only for not married root member of Main tree
												!isMarried(tree?.data?.bottomPartTree[0]) ? '100%' : null
											}
										>
											<Svg height={scale(80)} width="100">
												<Line
													x1="50%"
													y1="0"
													x2="50%"
													y2="150"
													stroke={pathColor}
													strokeWidth={strokeWidth}
												/>
											</Svg>
											<Svg
												height="3"
												width={!isMarried(tree?.data?.bottomPartTree[0]) ? '100%' : '100'}
											>
												{getHorizontalLinesFromTopTreesToMainTree(
													shouldSwapSubTreeAndRootTree(tree?.data?.bottomPartTree[0]),
													treeType,
													strokeWidth,
													pathColor,
													!isMarried(tree?.data?.bottomPartTree[0])
												)}
											</Svg>
										</Box>
									) : (
										// Note added width="150"
										// TODO: Remove borders
										<Box
											borderWidth={0}
											borderColor={'green.300'}
											width={
												// * NOTE Specific case if member in father's tree is not married and root user in Main (bottom) tree is not married too.
												treeType === TreeTypes.FatherAncestryTreeLine &&
												!isMarried(item) &&
												!isMarried(tree?.data?.bottomPartTree[0])
													? scale(200)
													: scale(150)
											}
										>
											<Svg height="70" width="20" style={treeStyles.alignSelfCenter}>
												<Line
													x1="50%"
													y1="0"
													x2="50%"
													y2="150"
													stroke={pathColor}
													strokeWidth={strokeWidth}
												/>
											</Svg>
											<Svg height="34" width="20" style={treeStyles.alignSelfCenter}>
												<Line
													x1="50%"
													y1="0"
													x2="50%"
													y2="150"
													stroke={pathColor}
													strokeWidth={strokeWidth}
												/>
											</Svg>
											<Svg height="3" width="100%" style={treeStyles.alignSelfCenter}>
												{getHorizontalLinesFromTopTreesToMainTree(
													shouldSwapSubTreeAndRootTree(tree?.data?.bottomPartTree[0]),
													treeType,
													strokeWidth,
													pathColor,
													!isMarried(tree?.data?.bottomPartTree[0])
												)}
											</Svg>
										</Box>
									)
								) : (
									hasChildren(item) && (
										<Svg height="35" width="100%">
											<Line
												x1="50%"
												y1="0"
												x2="50%"
												y2="150"
												// y2="100%"
												stroke={pathColor}
												strokeWidth={strokeWidth}
											/>
										</Svg>
									)
								)
							}
							<HStack>
								{
									// * Note: Rendering children is inside renderChildren function
									hasChildren(item) &&
										!isParentLineDuplication(item, treeType, parentIdentity) &&
										renderChildren(
											(item as ITreeMemberDescendant)?.descendant as TreePart,
											hasChildren(item),
											renderTree,
											treeType,
											level,
											strokeWidth,
											pathColor,
											parentIdentity
										)
								}
							</HStack>
						</Box>
					</HStack>
				);
			}
		});
	};

	if (treeLoading) {
		return <Spinner visible={treeLoading} color="#E8AD63" />;
	} else {
		return (
			<>
				{spouseLoading && !treeLoading && (
					<ActivityIndicator size="large" color="#E8AD63" style={treeStyles.spinnerStyle} />
				)}
				<ZoomableContainer
					authUserId={authUser.data?.id}
					authUserTreeId={authUser.data?.myTreeIdByParent1}
					initialOffsetY={
						containerHeight < 200
							? 0
							: initialOffsetY < 100
							? -300
							: containerHeight > 850
							? -100
							: containerHeight < 500
							? 300
							: 0
					}
				>
					<Box>
						<VStack justifyContent="center" alignItems="center">
							<HStack alignItems="flex-end">
								<VStack style={treeStyles.topTreesContainersStyle}>
									<Box alignItems="center" width={swapWidthAndHeightInPlaces(width, height, 0.5)}>
										{shouldSwapSubTreeAndRootTree(
											tree?.data?.bottomPartTree && tree?.data?.bottomPartTree[0]
										)
											? renderTree(
													shouldRenderSubTree(
														tree?.data?.bottomPartTree[0]?.married[0]?.identity,
														tree?.data?.subTree?.length > 0
															? tree?.data?.subTree[0]?.enterPointToSubTree[0]?.identity
															: null
													) &&
														// * Allow to render sub tree only when authorized user is not root user
														!!authUser?.data?.id &&
														!isRootMember(
															authUser.data?.id,
															tree?.data?.bottomPartTree[0]?.user?.identity
														)
														? tree?.data?.subTree
														: null,
													TreeTypes.MotherAncestryTreeLine,
													1,
													tree?.data?.bottomPartTree[0]?.married[0]?.identity
											  )
											: renderTree(
													tree?.data?.rootPartTree,
													TreeTypes.FatherAncestryTreeLine,
													1,
													tree?.data?.bottomPartTree &&
														tree?.data?.bottomPartTree[0]?.user?.identity
											  )}
									</Box>
								</VStack>
								<VStack style={treeStyles.topTreesContainersStyle}>
									<Box alignItems="center" width={swapWidthAndHeightInPlaces(width, height, 0.5)}>
										{shouldSwapSubTreeAndRootTree(
											tree?.data?.bottomPartTree && tree?.data?.bottomPartTree[0]
										)
											? renderTree(
													tree?.data?.rootPartTree,
													TreeTypes.FatherAncestryTreeLine,
													1,
													tree?.data?.bottomPartTree &&
														tree?.data?.bottomPartTree[0]?.user?.identity
											  )
											: renderTree(
													shouldRenderSubTree(
														tree?.data?.bottomPartTree &&
															tree?.data?.bottomPartTree[0]?.married[0]?.identity,
														tree?.data?.subTree?.length > 0
															? tree?.data?.subTree[0]?.enterPointToSubTree[0]?.identity
															: null
													) &&
														// * Allow to render sub tree only when authorized user is not root user
														!!authUser?.data?.id &&
														!isRootMember(
															authUser.data?.id,
															tree?.data?.bottomPartTree &&
																tree?.data?.bottomPartTree[0]?.user?.identity
														)
														? tree?.data?.subTree
														: null,
													TreeTypes.MotherAncestryTreeLine,
													1,
													tree?.data?.bottomPartTree &&
														tree?.data?.bottomPartTree[0]?.married[0]?.identity
											  )}
									</Box>
								</VStack>
							</HStack>
						</VStack>
						{/* Bottom (Main) Tree container */}
						<VStack alignItems="center" onLayout={onBottomTreeLayout}>
							{
								// Bottom (Main) tree
								renderTree(
									tree?.data?.bottomPartTree,
									TreeTypes.MainTree,
									tree?.data?.bottomPartTree &&
										tree?.data?.bottomPartTree[0]?.descendant?.length > 0
										? -1
										: 0
								)
							}
						</VStack>
						<AddUserToTreeModal
							isModalVisible={isModalVisible}
							setIsModalVisible={setIsModalVisible}
						/>
					</Box>
				</ZoomableContainer>
			</>
		);
	}
};

export default TreeScreen;
