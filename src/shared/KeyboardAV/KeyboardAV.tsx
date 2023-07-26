import React, {FC, ReactNode} from 'react';

import {Platform} from 'react-native';
import {KeyboardAvoidingView} from 'native-base';

import styles from './styles';

type KeyboardAVProps = {
	children: ReactNode;
};

const KeyboardAV: FC<KeyboardAVProps> = ({children}) => {
	return (
		<KeyboardAvoidingView
			// eslint-disable-next-line no-undefined
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={styles.container}
		>
			{children}
		</KeyboardAvoidingView>
	);
};

export {KeyboardAV};
