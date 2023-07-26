import React, {FC, useEffect, useState} from 'react';

import {Platform, Alert} from 'react-native';

import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import {Box, CheckIcon, Icon, Radio, Select, Text} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {AntDesign, Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';

import {updateUserByIdAsync, userSelector} from '~redux/slices/user';
import {getTreeInPartsByIdAsync, treeSelector} from '~redux/slices/tree';
import {authSelector} from '~redux/slices/auth';

import {DateInput, CustomTextInput, CustomButton} from '~shared';
import {InputType, STATES} from '~utils';
import {CalendarIcon} from '~shared/Icons';
import {useAppDispatch} from '~hooks/redux';

import styles from './styles';

type InitialValues = {
	dateOfBirth: string;
	dateOfDeath?: string;
	gender: string;
	streetAddress: string;
	bornAddress: string;
	employerAndPosition: string;
	pets: string;
	apartment: string;
	city: string;
	state: string;
	zip: string;
};

const FORM_VARIANTS = {
	employed: ['Yes', 'No', 'Retired'],
};

const EditProfileBasicInfoScreen: FC = () => {
	const dispatch = useAppDispatch();
	const navigation = useNavigation();

	const [basicInfo, setBasicInfo] = useState<InitialValues>();
	const [saving, setSaving] = useState(false);
	const user = useSelector(userSelector.getUser);
	const [deceased, setDeceased] = useState(user?.data?.isDeceased);
	const authUser = useSelector(authSelector.getAuthUser);
	const addressArea = user?.data?.address ? JSON.parse(user?.data?.address) : '';
	const tree = useSelector(treeSelector.getTree);

	const getEmployerAndPositionValue = (): string => {
		if (user?.data?.employerAndPosition?.length > 0) {
			if (user?.data?.employerAndPosition === 'Retired') {
				return 'Retired';
			}
			if (user?.data?.employerAndPosition !== 'No') {
				return 'Yes';
			}
		}
		return 'No';
	};

	const [employed, setEmployed] = useState<string>(getEmployerAndPositionValue());

	const InitialValues: InitialValues = {
		dateOfBirth: user?.data?.birthdate,
		dateOfDeath: user?.data?.dateOfDeath,
		gender: user?.data?.gender,
		bornAddress: user?.data?.bornAddress,
		employerAndPosition:
			user?.data?.employerAndPosition === 'Retired' || user?.data?.employerAndPosition === 'No'
				? ''
				: user?.data?.employerAndPosition,
		pets: user?.data?.pets,
		streetAddress: addressArea?.streetAddress,
		apartment: addressArea?.apartment,
		city: addressArea?.city,
		state: addressArea?.state,
		zip: addressArea?.zip,
	};

	useEffect(
		() =>
			navigation.addListener('beforeRemove', e => {
				if (saving) {
					return;
				}

				const dateOfBirthInputNotChanged = basicInfo?.dateOfBirth === user?.data?.birthdate;
				const dateOfDeathInputNotChanged = basicInfo?.dateOfDeath === user?.data?.dateOfDeath;
				const genderInputNotChanged = basicInfo?.gender === user?.data?.gender;
				const bornAddressNotChanged = basicInfo?.bornAddress === user?.data?.bornAddress;
				const streetAddressInputNotChanged =
					(addressArea?.streetAddress &&
						basicInfo?.streetAddress &&
						basicInfo?.streetAddress === addressArea?.streetAddress) ||
					(!basicInfo?.streetAddress && !addressArea?.streetAddress);
				const apartmentInputNotChanged =
					(addressArea?.apartment &&
						basicInfo?.apartment &&
						basicInfo?.apartment === addressArea?.apartment) ||
					(!basicInfo?.apartment && !addressArea?.apartment);
				const cityInputNotChanged =
					(addressArea?.city && basicInfo?.city && basicInfo?.city === addressArea?.city) ||
					(!basicInfo?.city && !addressArea?.city);
				const stateInputNotChanged =
					(addressArea?.state && basicInfo?.state && basicInfo?.state === addressArea?.state) ||
					(!basicInfo?.state && !addressArea?.state);
				const zipInputNotChanged =
					(addressArea?.zip && basicInfo?.zip && basicInfo?.zip === addressArea?.zip) ||
					(!basicInfo?.zip && !addressArea?.zip);
				const employedInputNotChanged =
					basicInfo?.employerAndPosition === user?.data?.employerAndPosition;
				const petsNotChanged = basicInfo?.pets === user?.data?.pets;

				if (
					![
						dateOfBirthInputNotChanged,
						dateOfDeathInputNotChanged,
						genderInputNotChanged,
						streetAddressInputNotChanged,
						apartmentInputNotChanged,
						cityInputNotChanged,
						stateInputNotChanged,
						zipInputNotChanged,
						employedInputNotChanged,
						petsNotChanged,
						bornAddressNotChanged,
					].some(inputStatus => inputStatus === false)
				) {
					return;
				}

				// Prevent default behavior of leaving the screen
				e.preventDefault();
				// Prompt the user before leaving the screen
				Alert.alert(
					'Discard changes?',
					'You have unsaved changes. Are you sure to discard them and leave the screen?',
					[
						{text: "Don't leave", style: 'cancel', onPress: () => {}},
						{
							text: 'Discard',
							style: 'destructive',
							// If the user confirmed, then we dispatch the action we blocked earlier
							// This will continue the action that had triggered the removal of the screen
							onPress: () => {
								navigation.dispatch(e.data.action);
								// dispatch(restoreFileUploads());
							},
						},
					]
				);
			}),
		[
			navigation,
			basicInfo?.dateOfBirth,
			basicInfo?.gender,
			basicInfo?.bornAddress,
			basicInfo?.streetAddress,
			basicInfo?.apartment,
			basicInfo?.city,
			basicInfo?.state,
			basicInfo?.zip,
			basicInfo?.employerAndPosition,
			basicInfo?.pets,
			user?.data?.birthdate,
			user?.data?.gender,
			addressArea?.streetAddress,
			addressArea?.apartment,
			addressArea?.city,
			addressArea?.state,
			addressArea?.zip,
			addressArea.dateOfBirth,
			addressArea.gender,
			saving,
			basicInfo?.dateOfDeath,
			user?.data?.dateOfDeath,
			user?.data?.bornAddress,
			user?.data?.employerAndPosition,
			user?.data?.pets,
		]
	);

	const onSubmit = async (values: InitialValues): Promise<void> => {
		await setSaving(true);
		await dispatch(
			updateUserByIdAsync({
				userId: user?.data?.id,
				userData: {
					birthdate: values.dateOfBirth,
					isDeceased: deceased,
					dateOfDeath: deceased ? values.dateOfDeath : '',
					bornAddress: values.bornAddress,
					pets: values.pets,
					employerAndPosition: employed === 'Retired' ? 'Retired' : values.employerAndPosition,
					gender: values.gender,
					address: JSON.stringify({
						streetAddress: values?.streetAddress,
						apartment: values?.apartment,
						city: values?.city,
						state: values?.state,
						// replace different charters from input for IOS and android numeric keyboard()
						zip: values?.zip?.replace(/[- #*;,.<>\{\}\[\]\\\/]/gi, ''),
					}),
				},
			})
		);
		await dispatch(
			getTreeInPartsByIdAsync({
				treeId: tree?.data?.myTreeIdByParent1,
				userId:
					tree.data?.bottomPartTree[0]?.descendant?.length > 0
						? tree.data?.bottomPartTree[0]?.descendant[0]?.user?.identity
						: tree.data?.bottomPartTree[0]?.user?.identity,
			})
		);
		navigation.goBack();
	};

	const onRadioButtonPressing = () => setDeceased(!deceased);

	return (
		<KeyboardAwareScrollView contentContainerStyle={styles.basicInfoScrollContainer}>
			<Formik initialValues={InitialValues} onSubmit={onSubmit}>
				{props => {
					setBasicInfo(props.values);
					return (
						<>
							<Box flex={1} alignItems="center" justifyContent="space-between" mt={8} pb={4}>
								<Box width="90%">
									<DateInput />
									<CustomTextInput
										title="Date of Birth"
										IconLeft={CalendarIcon}
										type={InputType.date}
										placeholder="Date of Birth"
										onChange={props.handleChange('dateOfBirth')}
										value={props.values.dateOfBirth}
										onBlur={props.handleBlur('dateOfBirth')}
									/>
									{authUser?.data?.id !== user?.data?.id && (
										<>
											<Radio.Group
												colorScheme="amber"
												name="deceased"
												accessibilityLabel="deceased"
												// @ts-ignore
												value={deceased}
											>
												{/* @ts-ignore */}
												<Radio onPress={onRadioButtonPressing} value={true}>
													<Text>Deceased</Text>
												</Radio>
											</Radio.Group>
											{deceased && (
												<CustomTextInput
													title="Date of Death"
													IconLeft={CalendarIcon}
													type={InputType.date}
													placeholder="Date of Death"
													onChange={props.handleChange('dateOfDeath')}
													value={props.values.dateOfDeath}
													onBlur={props.handleBlur('dateOfDeath')}
												/>
											)}
										</>
									)}
									<CustomTextInput
										title="Gender"
										type={InputType.gender}
										placeholder="Gender"
										dropdownIcon={Platform.OS !== 'ios' && true}
										onChange={props.handleChange('gender')}
										value={props.values.gender}
										onBlur={props.handleBlur('gender')}
									/>
									<CustomTextInput
										title="Place of Birth"
										placeholder="Place of Birth"
										onChange={props.handleChange('bornAddress')}
										value={props.values.bornAddress}
										onBlur={props.handleBlur('bornAddress')}
									/>
									<CustomTextInput
										title="Address"
										placeholder="Street address or P.O box"
										onChange={props.handleChange('streetAddress')}
										value={props.values.streetAddress}
										onBlur={props.handleBlur('streetAddress')}
									/>
									<CustomTextInput
										placeholder="Apt, suite, unit, building floor, etc"
										onChange={props.handleChange('apartment')}
										value={props.values.apartment}
										marginTop={2}
										onBlur={props.handleBlur('apartment')}
									/>
									<CustomTextInput
										title="City"
										placeholder="City"
										onChange={props.handleChange('city')}
										value={props.values.city}
										onBlur={props.handleBlur('city')}
									/>
									<Box>
										<Text fontFamily="Roboto-Regular">State</Text>
										<Select
											fontSize={16}
											paddingTop={3}
											paddingBottom={3}
											color={'#252A31'}
											marginTop={2}
											borderWidth={0}
											backgroundColor="#EFF2F5"
											width="100%"
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
											{STATES.map((state, index) => {
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
											title="ZIP code"
											placeholder="ZIP code"
											type={InputType.zip}
											onChange={props.handleChange('zip')}
											value={props.values.zip}
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
										{employed === 'Yes' && (
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

										<CustomTextInput
											title="Pet(s)"
											placeholder="Pet(s)"
											onChange={props.handleChange('pets')}
											value={props.values.pets}
											onBlur={props.handleBlur('pets')}
										/>
									</Box>
								</Box>
								<CustomButton onPress={props.handleSubmit} title="Save changes" />
							</Box>
						</>
					);
				}}
			</Formik>
		</KeyboardAwareScrollView>
	);
};

export default EditProfileBasicInfoScreen;
