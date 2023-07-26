import React, {FC} from 'react';

import {useTheme} from '@react-navigation/native';
import {Box, HStack, Radio, Text} from 'native-base';
import {useSelector} from 'react-redux';

import {useAppDispatch} from '~hooks/redux';
import {questionnaireSettingsSelector, setDoNotShowQuestionnaireModal} from '~redux/slices/auth';
import {CustomButton, CustomModal} from '~shared';
import {Platform} from 'react-native';

type SubmitQuestionnaireModalProps = {
	isModalVisible: boolean;
	setIsModalVisible: (isVisible: boolean) => void;
	onSubmit: () => void;
};

const SubmitQuestionnaireModal: FC<SubmitQuestionnaireModalProps> = ({
	isModalVisible,
	setIsModalVisible,
	onSubmit,
}) => {
	const {colors} = useTheme();
	const dispatch = useAppDispatch();

	const questionnaireSettings = useSelector(questionnaireSettingsSelector);

	const onRadioButtonPressing = (): void => {
		dispatch(setDoNotShowQuestionnaireModal(!questionnaireSettings.doNotShowQuestionnaireModal));
	};

	const handleModalSubmit = (): void => {
		dispatch(setDoNotShowQuestionnaireModal(questionnaireSettings.doNotShowQuestionnaireModal));
		onSubmit();
	};

	const hideModal = (): void => {
		dispatch(setDoNotShowQuestionnaireModal(questionnaireSettings.doNotShowQuestionnaireModal));
		setIsModalVisible(false);
	};

	return (
		<CustomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
			<Box
				height="100%"
				width="100%"
				padding={Platform.OS === 'ios' ? 10 : 0}
				paddingX={0}
				justifyContent="center"
				alignItems="center"
			>
				<Box
					backgroundColor="white"
					padding={Platform.OS === 'ios' ? 5 : 0}
					paddingY={0}
					borderRadius={10}
				>
					<Text>
						Please note that you won’t be able to go back to this page. All entered information can
						be adjusted later. Are you sure to proceed?
					</Text>
					<Box pt={5}>
						<HStack justifyContent="space-between">
							<CustomButton
								width="40%"
								textColor="white"
								onPress={handleModalSubmit}
								title="Yes"
								bgColor={colors.primary}
							/>
							<CustomButton
								width="40%"
								textColor="white"
								onPress={hideModal}
								title="No"
								bgColor={colors.primary}
							/>
						</HStack>
						<Radio.Group
							colorScheme="amber"
							mt={3}
							name="dontShowAgain"
							accessibilityLabel="dontShowAgain"
							// @ts-ignore
							value={questionnaireSettings.doNotShowQuestionnaireModal}
						>
							{/* @ts-ignore */}
							<Radio onPress={onRadioButtonPressing} value={true}>
								<Text>{`Don't show again`}</Text>
							</Radio>
						</Radio.Group>
					</Box>
				</Box>
			</Box>
		</CustomModal>
	);
};

export default SubmitQuestionnaireModal;
