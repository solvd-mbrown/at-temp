import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import {Box, Text} from 'native-base';

import SubmitQuestionnaireModal from '~screens/Questionnaire/commonComponents/SubmitQuestionnaireModal';
import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {updateUserByIdAsync} from '~redux/slices/user';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '~hooks/redux';

const SkipButton = () => {
	const authUser = useSelector(authSelector.getAuthUser);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const dispatch = useAppDispatch();

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

	const onPress = (): void => {
		setIsModalVisible(true);
	};

	const handleModalSubmit = async (): Promise<void> => {
		const updateUserResponse = await dispatch(
			updateUserByIdAsync({
				userId: authUser.data?.id,
				userData: {
					setting: {
						...questionnaireSettings,
						isSkipped: true,
					},
				},
			})
		);
		if (updateUserResponse) {
			dispatch(saveAuthUser(updateUserResponse.payload));
			setIsModalVisible(false);
		}
	};

	return (
		<>
			<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
				<Box height={10} justifyContent="center" alignItems="center">
					<Text>Skip questionnaire </Text>
				</Box>
			</TouchableOpacity>
			<SubmitQuestionnaireModal
				isModalVisible={isModalVisible}
				setIsModalVisible={setIsModalVisible}
				onSubmit={handleModalSubmit}
			/>
		</>
	);
};

export default SkipButton;
