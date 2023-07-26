import React, {useState, useEffect, FC} from 'react';

import {Box, Text} from 'native-base';
import * as Progress from 'react-native-progress';
import {Alert, TouchableOpacity} from 'react-native';
import {
	fileUploadsSelector,
	restoreErrorMessage,
	restoreSizeFileUpload,
	setCancelUploading,
} from '~redux/slices/fileUploads';
import {useDispatch, useSelector} from 'react-redux';

type UploadSpinnerPropsType = {
	total: number;
	loaded: number;
};

const UploadSpinner: FC<UploadSpinnerPropsType> = ({total, loaded}) => {
	const [progress, setProgress] = useState(0);
	const dispatch = useDispatch();

	const errors = useSelector(fileUploadsSelector.getError);

	useEffect(() => {
		if (total > 0 && loaded > 0) {
			setProgress(loaded / total);

			if (total === loaded) {
				setTimeout(() => {
					setProgress(0);
				}, 600);
			}
		}
	}, [total, loaded]);

	useEffect(() => {
		if (errors?.payload && errors?.payload !== 'canceled') {
			Alert.alert(
				'Ops something happened!',
				errors?.payload === 'Network Error'
					? 'Please check your internet connection!'
					: 'Server error!',
				[
					{
						onPress: () => {
							dispatch(restoreErrorMessage());
						},
					},
				]
			);
		}
	}, [dispatch, errors, errors?.payload]);

	const onPressHandler = async () => {
		dispatch(setCancelUploading(true));
		setProgress(0);
		dispatch(restoreSizeFileUpload());
	};

	return (
		<>
			{!errors && (
				<Box
					display={progress ? 'flex' : 'none'}
					zIndex={100}
					position="absolute"
					width="100%"
					height="100%"
					justifyContent="center"
					alignItems="center"
					backgroundColor={'rgba(0, 0, 0, 0.2)'}
				>
					<Progress.Circle
						// @ts-ignore
						indeterminateAnimationDuration={200}
						progress={progress}
						size={100}
						showsText={true}
						color={total && loaded && total === loaded ? 'green' : '#E8AD63'}
					/>
					<TouchableOpacity onPress={onPressHandler}>
						<Text
							padding={3}
							marginTop={1}
							fontSize={15}
							color={'red.700'}
							fontFamily="Roboto-Regular"
						>
							Cancel
						</Text>
					</TouchableOpacity>
				</Box>
			)}
		</>
	);
};

export {UploadSpinner};
