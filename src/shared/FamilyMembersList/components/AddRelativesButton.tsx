import React, {FC, useState} from 'react';

import {TouchableOpacity} from 'react-native';

import {HStack, Text, Icon} from 'native-base';
import {Feather, Ionicons} from '@expo/vector-icons';
import {useActionSheet} from '@expo/react-native-action-sheet';
import {scale} from 'react-native-utils-scale';
import {useDispatch} from 'react-redux';

import {setFamilyRelationFromCurrentUserToNewUser} from '~redux/slices/user';
import AddUserToTreeModal from '~screens/TreeScreens/components/AddUserToTreeModal';
import {getAddRelativesActionSheetOptions} from '~utils';
import {UserRelatives} from '~types/UserRelatives';
import {AddRelativesActionSheetOptions} from '~types/AddRelativesActionSheetOptions';

import styles from './styles';

type Props = {
	iconColor: string;
	textColor: string;
	userData: {
		userId: string;
		treeId: string;
	};
	userFamily: UserRelatives;
};

const AddRelativesButton: FC<Props> = ({
	iconColor,
	textColor,
	userData: {userId, treeId},
	userFamily,
}) => {
	const dispatch = useDispatch();
	const {showActionSheetWithOptions} = useActionSheet();

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const onOpenActionSheet = (): void => {
		const userInterfaceStyle: 'light' | 'dark' | undefined = 'light';

		const options: AddRelativesActionSheetOptions = getAddRelativesActionSheetOptions(userFamily);

		const cancelButtonIndex: number = options.length - 1;

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
				useModal: true,
			},
			(buttonIndex: number | undefined): void => {
				// eslint-disable-next-line no-undefined
				if (buttonIndex !== undefined) {
					if (buttonIndex === cancelButtonIndex) {
						setIsModalVisible(false);
					}
					if (buttonIndex !== cancelButtonIndex) {
						dispatch(setFamilyRelationFromCurrentUserToNewUser(options[buttonIndex]));
						setIsModalVisible(true);
					}
				}
			}
		);
	};

	return (
		<TouchableOpacity style={styles.button} onPress={onOpenActionSheet}>
			<HStack justifyContent="space-between" padding={scale(18)}>
				<HStack alignItems="center">
					<Icon
						as={Ionicons}
						name="add-circle-outline"
						size={30}
						color={iconColor}
						marginRight={scale(9)}
					/>
					<Text
						fontFamily="Roboto-Regular"
						fontWeight={400}
						fontSize={scale(16)}
						lineHeight={scale(19)}
						color={textColor}
					>
						Add relatives
					</Text>
				</HStack>
				<Icon as={Feather} name="chevron-right" size={25} color="black" />
			</HStack>
			<AddUserToTreeModal
				isModalVisible={isModalVisible}
				setIsModalVisible={setIsModalVisible}
				addRelativeInProfile={{
					parents: userFamily.parents,
					userId,
					treeId,
				}}
			/>
		</TouchableOpacity>
	);
};

export default AddRelativesButton;
