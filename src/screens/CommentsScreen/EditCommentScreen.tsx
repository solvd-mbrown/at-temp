import React, {useEffect, useRef, useState, FC} from 'react';

import {useTheme} from '@react-navigation/native';
import {TextInput} from 'react-native';
import {Box} from 'native-base';
import {useSelector} from 'react-redux';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {
	commentsSelector,
	getUserSingleCommentIdAsync,
	updateCommentByIdAsync,
} from '~redux/slices/comments';
import {CustomButton} from '~shared';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

import styles from './styles';
import {useAppDispatch} from '~hooks/redux';

type EditCommentScreenProps = StackScreenPropsWithParams<RouteStackList.EditCommentScreen>;

const EditCommentScreen: FC<EditCommentScreenProps> = ({route, navigation}) => {
	const {commentId} = route.params;
	const inputRef = useRef<any>();

	const {colors} = useTheme();

	const dispatch = useAppDispatch();
	const singleComment = useSelector(commentsSelector.getSingleComment);

	const [textValue, setTextValue] = useState('');

	useEffect(() => {
		inputRef.current.focus();
	}, []);

	useEffect(() => {
		dispatch(getUserSingleCommentIdAsync(commentId));
	}, [commentId, dispatch]);

	useEffect(() => {
		if (singleComment?.commentBody) {
			setTextValue(JSON.parse(singleComment?.commentBody).text);
		}
	}, [singleComment?.commentBody]);

	const onPressHandler = () => {
		if (textValue && textValue.length > 0) {
			dispatch(
				updateCommentByIdAsync({
					commentId: singleComment?.id,
					userId: singleComment?.publishedById,
					entityId: singleComment?.commentForEntityId,
					entityType: singleComment?.commentType,
					commentType: singleComment?.commentForEntityType,
					commentData: {text: textValue},
				})
			);
		}

		navigation.goBack();
	};

	return (
		<>
			<KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
				<TextInput
					style={styles.container}
					placeholder="Start typing your text..."
					onChangeText={setTextValue}
					value={textValue}
					ref={inputRef}
					multiline
					editable
				/>
			</KeyboardAwareScrollView>
			<Box position="absolute" alignSelf="center" bottom={8}>
				<CustomButton
					isNotDisabled={!(textValue.length > 0)}
					textColor={'white'}
					onPress={onPressHandler}
					title={'Save Changes'}
					bgColor={textValue.length > 0 ? colors.primary : 'grey'}
				/>
			</Box>
		</>
	);
};

export default EditCommentScreen;
