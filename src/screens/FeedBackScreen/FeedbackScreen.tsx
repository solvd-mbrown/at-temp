import React, {useState, useRef, useEffect, FC} from 'react';

import {StyleSheet, Linking} from 'react-native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useTheme} from '@react-navigation/native';
import {Input} from 'native-base';
import {useSelector} from 'react-redux';

import {userSelector} from '~redux/slices/user';
import {RECIPIENTEMAIL} from '~utils';
import {CustomButton} from '~shared';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

const styles = StyleSheet.create({
	scrollContainer: {
		paddingTop: 32,
		paddingLeft: 16,
		paddingRight: 16,
		height: '100%',
	},
});

type FeedbackScreenProps = StackScreenPropsWithParams<RouteStackList.FeedbackScreen>;

const FeedbackScreen: FC<FeedbackScreenProps> = ({navigation}) => {
	const {colors} = useTheme();
	const inputRef = useRef<any>(null);
	const [feedback, setFeedback] = useState<string>('');
	const user = useSelector(userSelector.getUser);

	useEffect(() => {
		if (inputRef.current !== null) {
			inputRef.current.focus();
		}
	}, []);

	const onPressHandler = async (): Promise<void> => {
		try {
			if (user?.data?.email) {
				//Don`t change markdown
				await Linking.openURL(
					`mailto:${RECIPIENTEMAIL}?cc=${user?.data?.email}&subject=Feedback from ${
						user?.data?.firstName ? user?.data?.firstName : ''
					} ${user?.data?.maidenName ? `(${user?.data?.maidenName})` : ''} ${
						user?.data?.lastName ? user?.data?.lastName : ''
					}, email - ${user?.data?.email ? user?.data?.email : ''}
         &body=Feedback from ${user?.data?.firstName ? user?.data?.firstName : ''} ${
						user?.data?.maidenName ? `(${user?.data?.maidenName})` : ''
					} ${user?.data?.lastName ? user?.data?.lastName : ''}, email - ${
						user?.data?.email ? user?.data?.email : ''
					}.%0D%0A${feedback}`
				);
			}
			navigation.goBack();
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
			<Input
				fontFamily="Roboto-Regular"
				placeholder="Start typing your text..."
				onChangeText={setFeedback}
				marginBottom={40}
				value={feedback}
				ref={inputRef}
				multiline
				editable
			/>
			<CustomButton
				isNotDisabled={!(feedback.length > 0)}
				textColor="white"
				onPress={onPressHandler}
				title="Send Feedback"
				bgColor={feedback.length > 0 ? colors.primary : 'grey'}
			/>
		</KeyboardAwareScrollView>
	);
};

export default FeedbackScreen;
