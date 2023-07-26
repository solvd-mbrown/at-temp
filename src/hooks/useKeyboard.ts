import {useState, useEffect} from 'react';
import {Keyboard} from 'react-native';

const useKeyboard = (): [boolean, () => void] => {
	const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

	const keyboardDismiss = (): void => {
		Keyboard.dismiss();
		setIsKeyboardVisible(false);
	};

	useEffect(() => {
		const onKeyboardShow = (): void => {
			setIsKeyboardVisible(true);
		};

		const onKeyboardHide = (): void => {
			setIsKeyboardVisible(false);
		};

		const showSubscription = Keyboard.addListener('keyboardDidShow', onKeyboardShow);
		const hideSubscription = Keyboard.addListener('keyboardDidHide', onKeyboardHide);

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	return [isKeyboardVisible, keyboardDismiss];
};

export {useKeyboard};
