import React, {useState, useEffect, ReactNode, FC, ChangeEvent} from 'react';

import {View, TextInput, TouchableOpacity} from 'react-native';

import {Box, Icon, Text} from 'native-base';
import TextInputMask from 'react-native-text-input-mask';
import {AntDesign} from '@expo/vector-icons';
import {FormikErrors} from 'formik';

import {useActionSheet} from '@expo/react-native-action-sheet';
import dayjs from 'dayjs';

import {InputType} from '~utils';

import {DateInput} from './DateInput';
import styles from './styles';

type WrapperProps = {
	type?: InputType;
	onPress: () => void;
	children: ReactNode;
};

const Wrapper: FC<WrapperProps> = ({type, onPress, children}) => {
	return (
		<>
			{type === InputType.date || InputType.gender ? (
				<TouchableOpacity style={styles.innerContainer} onPress={onPress}>
					{children}
				</TouchableOpacity>
			) : (
				<View style={styles.innerContainer}>{children}</View>
			)}
		</>
	);
};

type CustomInputValue = string | Date | undefined;

type CustomTextInputProps = {
	placeholder: string;
	value?: string;
	onChange: ((value: CustomInputValue) => void) | ((e: string | ChangeEvent<any>) => void);
	type?: InputType;
	IconLeft?: Function;
	dropdownIcon?: ReactNode;
	error?: string | false | string[] | FormikErrors<any> | FormikErrors<any>[] | null | undefined;
	onBlur: (() => void) | ((e: any) => void);
	bgColor?: string;
	marginTop?: number;
	title?: string;
	disabled?: boolean;
	marginTopErrorLabel?: number;
	marginBottomErrorLabel?: number;
};

const CustomTextInput: FC<CustomTextInputProps> = ({
	placeholder,
	IconLeft,
	dropdownIcon,
	value,
	onChange,
	type,
	error,
	onBlur,
	bgColor = '#EFF2F5',
	marginTop,
	title,
	disabled = false,
	marginTopErrorLabel,
	marginBottomErrorLabel,
}) => {
	const {showActionSheetWithOptions} = useActionSheet();

	const [inputValue, setValue] = useState<string | undefined>(value || '');
	const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);

	useEffect(() => {
		setValue(value);
	}, [value]);

	const handleChange = (handledValue: CustomInputValue): void => {
		if (typeof handledValue !== 'string') {
			if (handledValue) {
				setValue(handledValue?.toString());
				if (onChange) {
					onChange(handledValue?.toString());
				}
			}
		} else {
			// replace different charts from zip input for IOS and android numeric keyboard()
			setValue(
				type === InputType.zip
					? handledValue?.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, '')
					: handledValue
			);
			if (onChange) {
				onChange(
					type === InputType.zip
						? handledValue?.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, '')
						: handledValue
				);
			}
		}
	};

	const onOpenActionSheet = (): void => {
		const options: Array<string> = ['Male', 'Female', 'Non-binary', 'Cancel'];
		const cancelButtonIndex: number = options.length - 1;
		const userInterfaceStyle: 'light' | 'dark' | undefined = 'light';

		showActionSheetWithOptions(
			{
				options,
				cancelButtonIndex,
				userInterfaceStyle,
			},
			(buttonIndex: number | undefined): void => {
				// eslint-disable-next-line no-undefined
				if (buttonIndex !== undefined && buttonIndex >= 0 && buttonIndex !== cancelButtonIndex) {
					handleChange(options[buttonIndex]);
				}
			}
		);
	};

	const onButtonPress = (): void => {
		if (disabled) {
			return;
		}
		if (type === InputType.date) {
			setDatePickerVisibility(true);
		}
		if (type === InputType.gender) {
			onOpenActionSheet();
		}
	};

	const getDateFromString = (stringToParse: string): Date | undefined => {
		if (type === InputType.date && typeof stringToParse === 'string' && stringToParse !== '') {
			const date = dayjs(stringToParse).toDate();
			return date;
		}
	};

	const handlePhoneNumberChange = (formatted: string, extracted: string | undefined): void => {
		// console.log(formatted) // 123-456-7890
		// console.log(extracted) // 1234567890
		if (extracted) {
			handleChange(extracted);
			setValue(extracted);
		}
	};

	return (
		<Box>
			{title && (
				<Text
					fontFamily="Roboto-Regular"
					color="#252A31"
					fontWeight={400}
					fontSize={14}
					lineHeight={28}
				>
					{title}
				</Text>
			)}
			<View style={styles.container(error, bgColor, marginTop)}>
				<Wrapper type={type} onPress={onButtonPress}>
					{IconLeft ? (
						<Box marginRight={2}>
							<IconLeft />
						</Box>
					) : null}
					{type === InputType.phone ? (
						<TextInputMask
							keyboardType="numeric"
							style={[styles.input, styles.textInputMask]}
							onChangeText={handlePhoneNumberChange}
							placeholder={placeholder}
							mask={'[000]-[000]-[0000]'}
							value={inputValue}
						/>
					) : type !== InputType.date && type !== InputType.gender ? (
						<TextInput
							editable={!disabled}
							autoCapitalize="none"
							keyboardType={type === InputType.zip ? 'numeric' : 'default'}
							autoCorrect={false}
							placeholder={placeholder}
							placeholderTextColor={'#ACB4BE'}
							style={[styles.input, disabled && styles.disable]}
							onChangeText={handleChange}
							onBlur={onBlur}
							value={inputValue}
						/>
					) : (
						<>
							<Text fontFamily="Roboto-Regular" style={styles.input}>
								{type === InputType.date
									? (inputValue && dayjs(inputValue).format('MM-DD-YYYY').toString()) ||
									  // title
									  'mm-dd-yyyy'
									: type === InputType.gender
									? inputValue || 'Gender'
									: inputValue}
							</Text>
						</>
					)}
					{dropdownIcon ? (
						<Icon as={AntDesign} name={'down'} size={4} color="black" style={styles.iconRight} />
					) : null}
				</Wrapper>
			</View>

			{error && (
				<Text
					fontFamily="Roboto-Regular"
					style={styles.errorLabel(marginTopErrorLabel, marginBottomErrorLabel)}
				>
					{error as ReactNode}
				</Text>
			)}

			<DateInput
				isVisible={isDatePickerVisible}
				setDateValue={handleChange}
				setVisibility={setDatePickerVisibility}
				dateValue={getDateFromString(inputValue!)}
			/>
		</Box>
	);
};

export {CustomTextInput};
