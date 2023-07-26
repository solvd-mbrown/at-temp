import React, {FC} from 'react';

import {TouchableHighlight, Platform} from 'react-native';

import {Text, VStack, Box, CloseIcon, Select, CheckIcon, Icon} from 'native-base';
import {Formik, FormikHelpers} from 'formik';
import uuid from 'react-native-uuid';
import {useTheme} from '@react-navigation/native';
import {AntDesign, Ionicons} from '@expo/vector-icons';

import {createRelativeAsync, createUser} from '~redux/slices/user';

import {CustomButton, CustomTextInput, CustomModal} from '~shared';
import {InputType, treeModalSchema} from '~utils';
import {IRelative} from '~interfaces/IRelative';
import {useAppDispatch} from '~hooks/redux';

import {styles} from './styles';

type AddUserToTreeModalProps = {
	isModalVisible: boolean;
	setIsModalVisible: (isVisible: boolean) => void;
	addRelativeInProfile?: {
		userId: string;
		treeId: string;
		parents?: IRelative[];
	};
};

type InitialValues = {
	firstName: string;
	lastName: string;
	gender: string;
};

const AddUserToTreeModal: FC<AddUserToTreeModalProps> = ({
	isModalVisible,
	setIsModalVisible,
	addRelativeInProfile,
}) => {
	const dispatch = useAppDispatch();
	const {colors} = useTheme();

	const InitialValues: InitialValues = {
		firstName: '',
		lastName: '',
		gender: '',
	};

	const closeModal = () => setIsModalVisible(false);

	const onSubmit = (values: InitialValues, actions: FormikHelpers<InitialValues>): void => {
		const uniqueEmail = 'a' + uuid.v4() + '@arrtree.com';

		if (addRelativeInProfile) {
			dispatch(
				createRelativeAsync({
					userId: addRelativeInProfile.userId,
					treeId: addRelativeInProfile.treeId,
					parents: addRelativeInProfile.parents,
					newRelativeData: {
						firstName: values.firstName,
						lastName: values.lastName,
						gender: values.gender,
						email: uniqueEmail,
					},
					addRelativeViaModal: true,
				})
			);
			setIsModalVisible(false);
		} else {
			dispatch(
				createUser({
					userData: {
						firstName: values.firstName,
						lastName: values.lastName,
						gender: values.gender,
						email: uniqueEmail,
					},
				})
			);
		}

		actions.resetForm();
	};

	return (
		<CustomModal isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible}>
			<VStack
				bgColor="white"
				alignItems="center"
				justifyContent="center"
				paddingX={4}
				paddingY={4}
				borderRadius={12}
			>
				<TouchableHighlight
					underlayColor="#DDDDD"
					activeOpacity={0.7}
					style={styles.button}
					onPress={closeModal}
				>
					{Platform.OS === 'ios' ? (
						<CloseIcon />
					) : (
						<Icon color="red.300" as={Ionicons} name="md-close-sharp" size={5} />
					)}
				</TouchableHighlight>
				<Formik
					initialValues={InitialValues}
					validationSchema={treeModalSchema}
					onSubmit={onSubmit}
				>
					{props => (
						<>
							<Box
								alignItems="center"
								justifyContent="center"
								pt={Platform.OS === 'ios' ? 8 : 4}
								width="100%"
							>
								<Box width="90%" mb={4}>
									<CustomTextInput
										title="First Name"
										placeholder="First Name"
										marginTop={2}
										marginTopErrorLabel={-8}
										marginBottomErrorLabel={0}
										onChange={props.handleChange('firstName')}
										value={props.values.firstName}
										error={
											props.touched.firstName && props.errors.firstName
												? props.errors.firstName
												: null
										}
										onBlur={props.handleBlur('firstName')}
									/>
									<CustomTextInput
										title="Last Name"
										placeholder="Last Name"
										marginTop={2}
										marginTopErrorLabel={-8}
										marginBottomErrorLabel={0}
										onChange={props.handleChange('lastName')}
										value={props.values.lastName}
										error={
											props.touched.lastName && props.errors.lastName ? props.errors.lastName : null
										}
										onBlur={props.handleBlur('lastName')}
									/>

									{Platform.OS === 'ios' ? (
										<CustomTextInput
											title="Gender"
											type={InputType.gender}
											placeholder="Gender"
											dropdownIcon
											marginTop={2}
											marginTopErrorLabel={-8}
											marginBottomErrorLabel={0}
											onChange={props.handleChange('gender')}
											value={props.values.gender}
											error={
												props.touched.gender && props.errors.gender ? props.errors.gender : null
											}
											onBlur={props.handleBlur('gender')}
										/>
									) : (
										<Box>
											<Text fontFamily="Roboto-Regular">Gender</Text>
											<Select
												fontSize={16}
												marginTop={1.5}
												color={colors.text}
												borderColor={props.touched.gender && props.errors.gender ? 'red.500' : null}
												borderWidth={props.touched.gender && props.errors.gender ? 2 : 0}
												borderRadius={6}
												backgroundColor="#EFF2F5"
												width="100%"
												accessibilityLabel="Choose Gender"
												placeholder="Choose Gender"
												defaultValue={props.values.gender}
												selectedValue={props.values.gender}
												onValueChange={props.handleChange('gender')}
												dropdownIcon={
													Platform.OS === 'android' ? (
														<Icon as={AntDesign} name="down" size={4} style={styles.icon} />
													) : // eslint-disable-next-line no-undefined
													undefined
												}
												_selectedItem={{
													endIcon:
														Platform.OS === 'android' ? (
															<CheckIcon size={5} />
														) : (
															<Icon as={Ionicons} name="checkmark" size={5} />
														),
												}}
												mt="1"
											>
												<Select.Item label="Male" value="Male" />
												<Select.Item label="Female" value="Female" />
												<Select.Item label="Non-binary" value="Non-binary" />
											</Select>
											{props.touched.gender && props.errors.gender && (
												<Text fontFamily="Roboto-Regular" style={styles.errorLabel}>
													Gender is required
												</Text>
											)}
										</Box>
									)}
								</Box>
								<CustomButton
									onPress={props.handleSubmit}
									isNotDisabled={
										props.isValid &&
										!props.values.firstName &&
										!props.values.lastName &&
										!props.values.gender
									}
									bgColor={
										props.values.firstName || props.values.lastName || props.values.gender
											? colors.primary
											: '#DDDDDD'
									}
									title="Add new user"
									width="70%"
								/>
							</Box>
						</>
					)}
				</Formik>
			</VStack>
		</CustomModal>
	);
};

export default AddUserToTreeModal;
