import React, {useState, useRef} from 'react';

import {Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import {Box, CheckIcon, Icon, Radio, Select, Text} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {AntDesign, Ionicons} from '@expo/vector-icons';

import {authSelector, questionnaireSettingsSelector, saveAuthUser} from '~redux/slices/auth';
import {updateUserByIdAsync} from '~redux/slices/user';

import {useKeyboard} from '~hooks';
import {useAppDispatch} from '~hooks/redux';

import {CustomButton, CustomTextInput} from '~shared';
import {extraDetailsSchema, STATES} from '~utils';

import styles from '~screens/EditProfileScreens/styles';
import SubmitQuestionnaireModal from '~screens/Questionnaire/commonComponents/SubmitQuestionnaireModal';

const FORM_VARIANTS = {
	employed: ['yes', 'no', 'Retired'],
	pets: ['yes', 'no'],
};

type InitialValues = {
	[k: string]: string;
};

const ExtraQuestions = () => {
	const dispatch = useAppDispatch();
	const authUser = useSelector(authSelector.getAuthUser);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);

	const [employed, setEmployed] = useState<string>();
	const [havePets, setHavePets] = useState<string>();
	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isKeyboardVisible, keyboardDismiss] = useKeyboard();

	const initialFormValues = {
		employerAndPosition: '',
		pets: '',
		birthPlace: '',
		addressLine1: '',
		addressLine2: '',
		city: '',
		state: '',
		zip: '',
	};

	const handleSubmit = async (values: InitialValues): Promise<void> => {
		keyboardDismiss();
		const updateUserResponse = await dispatch(
			updateUserByIdAsync({
				userId: authUser.data?.id,
				userData: {
					bornAddress: values.birthPlace,
					pets: values.pets,
					employerAndPosition: employed === 'Retired' ? 'Retired' : values.employerAndPosition,
					address: JSON.stringify({
						streetAddress: values?.addressLine1,
						apartment: values?.addressLine2,
						city: values?.city,
						state: values?.state,
						// replace different charters from input for IOS and android numeric keyboard()
						zip: values?.zip?.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, ''),
					}),
					setting: {
						...questionnaireSettings,
						step7_ExtraQuestions: {
							isStep7Completed: true,
						},
						isCompleted: true,
					},
				},
			})
		);
		if (updateUserResponse) {
			dispatch(saveAuthUser(updateUserResponse.payload));
			setIsModalVisible(false);
		}
	};

	const onNext =
		(onSubmit: () => void): (() => void) =>
		(): void => {
			if (questionnaireSettings.doNotShowQuestionnaireModal) {
				onSubmit();
			} else {
				setIsModalVisible(true);
			}
		};

	// TODO types for useRef
	const scrollViewRef = useRef();

	return (
		<KeyboardAwareScrollView
			enableOnAndroid
			extraHeight={0}
			// @ts-ignore
			ref={scrollViewRef}
			onContentSizeChange={_ => {
				if (Platform.OS === 'ios' || (Platform.OS === 'android' && !isKeyboardVisible)) {
					// @ts-ignore
					scrollViewRef?.current?.scrollToEnd({animated: true});
				}
			}}
		>
			<Text alignSelf="center" marginY={4}>
				Step 7/7
			</Text>
			<Formik
				enableReinitialize
				initialValues={initialFormValues}
				validationSchema={extraDetailsSchema(employed)}
				onSubmit={handleSubmit}
			>
				{props => (
					<Box alignItems="center" justifyContent="center" mt={15} mb={5} width={'100%'}>
						<Box width="90%">
							<CustomTextInput
								title="Where were you born?"
								placeholder="Place of Birth"
								marginTop={2}
								marginTopErrorLabel={-8}
								marginBottomErrorLabel={0}
								onChange={props.handleChange('birthPlace')}
								value={props.values.birthPlace}
								error={
									props.touched.birthPlace && props.errors.birthPlace
										? props.errors.birthPlace
										: null
								}
								onBlur={props.handleBlur('birthPlace')}
							/>
							<Text>Where do you live now?</Text>
							<CustomTextInput
								placeholder="Address line 1"
								marginTop={2}
								marginTopErrorLabel={-8}
								marginBottomErrorLabel={0}
								onChange={props.handleChange('addressLine1')}
								value={props.values.addressLine1}
								error={
									props.touched.addressLine1 && props.errors.addressLine1
										? props.errors.addressLine1
										: null
								}
								onBlur={props.handleBlur('addressLine1')}
							/>
							<CustomTextInput
								placeholder="Address line 2"
								marginTop={2}
								marginTopErrorLabel={-8}
								marginBottomErrorLabel={0}
								onChange={props.handleChange('addressLine2')}
								value={props.values.addressLine2}
								error={
									props.touched.addressLine2 && props.errors.addressLine2
										? props.errors.addressLine2
										: null
								}
								onBlur={props.handleBlur('addressLine2')}
							/>
							<CustomTextInput
								placeholder="City"
								marginTop={2}
								marginTopErrorLabel={-8}
								marginBottomErrorLabel={0}
								onChange={props.handleChange('city')}
								value={props.values.city}
								error={props.touched.city && props.errors.city ? props.errors.city : null}
								onBlur={props.handleBlur('city')}
							/>
							<Text>State</Text>
							<Select
								fontSize={16}
								paddingTop={3}
								paddingBottom={3}
								color={'#252A31'}
								marginTop={2}
								borderWidth={0}
								backgroundColor="#EFF2F5"
								accessibilityLabel="Choose State"
								placeholder="Choose State"
								{...{
									selectedValue: props.values.state ? props.values.state : false,
								}}
								selectedValue={props.values.state === 'None' ? '' : props.values.state}
								onValueChange={props.handleChange('state')}
								dropdownIcon={
									Platform.OS !== 'ios' ? (
										<Icon as={AntDesign} name="down" size={4} style={styles.icon} />
									) : // eslint-disable-next-line no-undefined
									undefined
								}
								_selectedItem={{
									endIcon:
										Platform.OS === 'ios' ? (
											<CheckIcon size={5} />
										) : (
											<Icon as={Ionicons} name="checkmark" size={5} />
										),
								}}
								mt="3"
								mb="2"
							>
								{STATES.slice(1).map((state, index) => {
									return (
										<Select.Item
											key={state + index}
											label={state}
											value={state !== 'None' ? state : ''}
										/>
									);
								})}
							</Select>
							<CustomTextInput
								placeholder="ZIP code"
								marginTop={2}
								marginTopErrorLabel={-8}
								marginBottomErrorLabel={0}
								onChange={props.handleChange('zip')}
								value={props.values.zip}
								error={props.touched.zip && props.errors.zip ? props.errors.zip : null}
								onBlur={props.handleBlur('zip')}
							/>
							<Text>Are you employed?</Text>
							<Radio.Group
								colorScheme="amber"
								name="employed"
								accessibilityLabel="employed"
								value={employed}
								onChange={value => {
									setEmployed(value);
									props.setFieldValue('employerAndPosition', '');
								}}
							>
								{FORM_VARIANTS.employed.map(variants => (
									<Radio value={variants} key={variants} my={1}>
										<Text>{variants.charAt(0).toUpperCase() + variants.slice(1)}</Text>
									</Radio>
								))}
							</Radio.Group>
							{employed === 'yes' && (
								<CustomTextInput
									title="Employer and Position"
									placeholder="Employer and Position"
									marginTop={2}
									marginTopErrorLabel={-8}
									marginBottomErrorLabel={0}
									onChange={props.handleChange('employerAndPosition')}
									value={props.values.employerAndPosition}
									error={
										props.touched.employerAndPosition && props.errors.employerAndPosition
											? props.errors.employerAndPosition
											: null
									}
									onBlur={props.handleBlur('employerAndPosition')}
								/>
							)}
							<Text>Do you have any pets?</Text>
							<Radio.Group
								colorScheme="amber"
								name="havePets"
								accessibilityLabel="havePets"
								value={havePets}
								onChange={value => {
									setHavePets(value);
									props.setFieldValue('pets', '');
								}}
							>
								{FORM_VARIANTS.pets.map(variants => (
									<Radio value={variants} key={variants} my={1}>
										<Text>{variants.charAt(0).toUpperCase() + variants.slice(1)}</Text>
									</Radio>
								))}
							</Radio.Group>
							{havePets === 'yes' && (
								<CustomTextInput
									title="Pet(s)"
									placeholder="Pet(s)"
									marginTop={2}
									marginTopErrorLabel={-8}
									marginBottomErrorLabel={0}
									onChange={props.handleChange('pets')}
									value={props.values.pets}
									error={props.touched.pets && props.errors.pets ? props.errors.pets : null}
									onBlur={props.handleBlur('pets')}
								/>
							)}
							{((employed === 'yes' && props.values.employerAndPosition) ||
								employed === 'Retired' ||
								employed === 'no') &&
								props.values.birthPlace &&
								props.values.state &&
								props.values.city && (
									<CustomButton
										marginTop={20}
										onPress={onNext(props.handleSubmit)}
										title="Finish"
									/>
								)}
						</Box>
						<SubmitQuestionnaireModal
							isModalVisible={isModalVisible}
							setIsModalVisible={setIsModalVisible}
							onSubmit={props.handleSubmit}
						/>
					</Box>
				)}
			</Formik>
		</KeyboardAwareScrollView>
	);
};

export default ExtraQuestions;
