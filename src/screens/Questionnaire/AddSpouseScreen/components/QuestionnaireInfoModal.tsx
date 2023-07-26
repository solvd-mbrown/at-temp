import React, {FC} from 'react';

import {Platform} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {Box, Text} from 'native-base';

import {CustomButton, CustomModal} from '~shared';

type QuestionnaireInfoModalProps = {
	isModalVisible: boolean;
	setIsModalVisible: (isVisible: boolean) => void;
};

const QuestionnaireInfoModal: FC<QuestionnaireInfoModalProps> = ({
	isModalVisible,
	setIsModalVisible,
}) => {
	const {colors} = useTheme();

	const hideModal = (): void => setIsModalVisible(false);

	return (
		<CustomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
			<Box
				height="100%"
				width="100%"
				padding={Platform.OS === 'ios' ? 12 : 0}
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
						To get started, use our intro questionnaire to quickly add your immediate family members
						to your family tree and fill in your personal profile.
					</Text>
					<Box pt={5}>
						<CustomButton
							width="40%"
							textColor="white"
							onPress={hideModal}
							title="OK"
							bgColor={colors.primary}
						/>
					</Box>
				</Box>
			</Box>
		</CustomModal>
	);
};

export default QuestionnaireInfoModal;
