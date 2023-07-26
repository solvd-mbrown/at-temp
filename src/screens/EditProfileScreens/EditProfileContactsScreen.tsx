import React, {FC, useState, useEffect} from 'react';

import {Alert} from 'react-native';

import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import {Box} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useNavigation, useTheme} from '@react-navigation/native';

import {updateUserByIdAsync, userSelector} from '~redux/slices/user';
import {useAppDispatch} from '~hooks/redux';

import {CustomTextInput, CustomButton} from '~shared';
import {emailSchema, getEmailOrEmptyString, InputType} from '~utils';

import styles from './styles';

type InitialValues = {
	email: string;
	phone: string;
};

const EditProfileContactsScreen: FC = () => {
	const dispatch = useAppDispatch();

	const user = useSelector(userSelector.getUser);

	const {colors} = useTheme();
	const [contacts, setContacts] = useState<InitialValues>();
	const [saving, setSaving] = useState(false);
	const navigation = useNavigation();

	useEffect(
		() =>
			navigation.addListener('beforeRemove', e => {
				if (saving) {
					return;
				}

				const emailInputNotChanged = contacts?.email === getEmailOrEmptyString(user?.data?.email);
				const phoneInputNotChanged =
					(user?.data?.phone && contacts?.phone && contacts?.phone === user?.data?.phone) ||
					(!contacts?.phone && !user?.data?.phone);

				if (
					![emailInputNotChanged, phoneInputNotChanged].some(inputStatus => inputStatus === false)
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
		[contacts?.email, contacts?.phone, navigation, saving, user?.data?.email, user?.data?.phone]
	);

	const InitialValues: InitialValues = {
		email: getEmailOrEmptyString(user?.data?.email),
		phone: user?.data?.phone,
	};

	const onSubmit = async (values: InitialValues): Promise<void> => {
		await setSaving(true);
		await dispatch(
			updateUserByIdAsync({
				userId: user?.data?.id,
				userData: {
					email: values.email,
					phone: values.phone,
				},
			})
		);
		navigation.goBack();
	};

	return (
		<KeyboardAwareScrollView contentContainerStyle={styles.contactsScrollConrtainer}>
			<Formik initialValues={InitialValues} validationSchema={emailSchema} onSubmit={onSubmit}>
				{props => {
					setContacts(props.values);
					return (
						<>
							<Box flex={1} alignItems="center" justifyContent="space-between" mt={8} pb={4}>
								<Box width="90%">
									<CustomTextInput
										disabled={user?.data?.isActivated}
										title="Email"
										placeholder="username@mail.com"
										onChange={props.handleChange('email')}
										value={props.values.email}
										error={props.touched.email && props.errors.email ? props.errors.email : null}
										onBlur={props.handleBlur('email')}
									/>
									<CustomTextInput
										type={InputType.phone}
										title="Phone"
										placeholder="XXX-XXX-XXXX"
										onChange={props.handleChange('phone')}
										value={props.values.phone}
										error={
											props.values.phone?.length === 10 ||
											props.values.phone === '' ||
											// eslint-disable-next-line no-undefined
											props.values.phone === undefined
												? null
												: 'Invalid phone number'
										}
										onBlur={props.handleBlur('phone')}
									/>
								</Box>
								<CustomButton
									bgColor={
										props.isValid &&
										props.values.email &&
										(props.values.phone
											? props.values.phone.length === 10
											: // eslint-disable-next-line no-undefined
											  props.values.phone === undefined || props.values.phone === '')
											? colors.primary
											: 'grey'
									}
									isNotDisabled={
										!(
											props.isValid &&
											props.values.email &&
											(props.values.phone
												? props.values.phone.length === 10
												: // eslint-disable-next-line no-undefined
												  props.values.phone === undefined || props.values.phone === '')
										)
									}
									onPress={props.handleSubmit}
									title="Save changes"
								/>
							</Box>
						</>
					);
				}}
			</Formik>
		</KeyboardAwareScrollView>
	);
};

export default EditProfileContactsScreen;
