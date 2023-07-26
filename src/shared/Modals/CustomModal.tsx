import React, {FC, ReactNode} from 'react';

import {Platform} from 'react-native';

import Modal from 'react-native-modal';
import {Modal as NativeBaseModal} from 'native-base';

import styles from './styles';

type CustomModalProps = {
	isModalVisible: boolean;
	setIsModalVisible: (isVisible: boolean) => void;
	children: ReactNode;
};

const CustomModal: FC<CustomModalProps> = ({isModalVisible, setIsModalVisible, children}) => {
	const hideModal = (): void => setIsModalVisible(false);

	if (Platform.OS === 'android') {
		return (
			<NativeBaseModal
				isOpen={isModalVisible}
				// size="lg"
				bottom="4"
				avoidKeyboard
				onClose={hideModal}
			>
				<NativeBaseModal.Content bgColor="white">
					<NativeBaseModal.Body>{children}</NativeBaseModal.Body>
				</NativeBaseModal.Content>
			</NativeBaseModal>
		);
	} else {
		return (
			<Modal
				style={styles.modalContainer}
				isVisible={isModalVisible}
				avoidKeyboard={true}
				useNativeDriver
				hideModalContentWhileAnimating
				useNativeDriverForBackdrop
				onBackdropPress={hideModal}
			>
				{children}
			</Modal>
		);
	}
};
export {CustomModal};
