import React, {FC, useEffect} from 'react';

import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import {Box, Text} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {updateUserByIdAsync, userSelector} from '~redux/slices/user';
import {authSelector, questionnaireSettingsSelector} from '~redux/slices/auth';

import {useAppDispatch} from '~hooks/redux';

import {CustomTextInput, CustomButton} from '~shared';
import {CalendarIcon, LogoIcon} from '~shared/Icons';
import {InputType, signUpSchema} from '~utils';

import {QuestionnaireSettings} from '~types/QuestionnaireSettings';

import {styles} from './styles';
import {RouteStackList, StackScreenPropsWithParams} from '~types/NavigationTypes';

import {deepLinksSelector} from '~redux/slices/deepLinks';

type InitialValues = {
	firstName: string;
	lastName: string;
	maidenName?: string;
	birthdate: string;
	gender: string;
};

interface IUserDataDependingOnGender extends InitialValues {
	isActivated: boolean;
	setting: QuestionnaireSettings;
}

type WelcomeScreenProps = StackScreenPropsWithParams<RouteStackList.WelcomeScreen>;

const WelcomeScreen: FC<WelcomeScreenProps> = ({navigation}) => {
	const dispatch = useAppDispatch();

	const authUser = useSelector(authSelector.getAuthUser);
	const questionnaireSettings = useSelector(questionnaireSettingsSelector);
	const isInvitedUser = useSelector(userSelector.isInvitedUser);

	const {
		params: {userId, invitedBy},
	} = useSelector(deepLinksSelector.getInviteLink);

	useEffect(() => {
		if (userId) {
			isInvitedUser
				? navigation?.navigate(RouteStackList.UserIsExistModalScreen)
				: navigation?.navigate(RouteStackList.CongratulationModalScreen, {
						lastName: invitedBy,
				  });
		}
	}, [invitedBy, navigation, userId, isInvitedUser]);

	const getUserDataDependingOnGender = (values: InitialValues): IUserDataDependingOnGender => {
		if (
			values.gender.toLocaleLowerCase() === 'female' ||
			values.gender.toLocaleLowerCase() === 'non-binary'
		) {
			return {
				firstName: values?.firstName,
				lastName: values?.lastName,
				maidenName: values?.maidenName,
				birthdate: values?.birthdate,
				gender: values?.gender,
				isActivated: true,
				setting: {
					...questionnaireSettings,
					isUserUpdatedOnWelcomeScreen: true,
				},
			};
		}
		return {
			firstName: values?.firstName,
			lastName: values?.lastName,
			birthdate: values?.birthdate,
			gender: values?.gender,
			isActivated: true,
			setting: {
				...questionnaireSettings,
				isUserUpdatedOnWelcomeScreen: true,
			},
		};
	};
	const initialValues: InitialValues = {
		firstName: '',
		lastName: '',
		maidenName: '',
		birthdate: '',
		gender: '',
	};

	const onSubmit = async (values: InitialValues): Promise<void> => {
		await dispatch(
			updateUserByIdAsync({
				userId: authUser.data?.id,
				userData: getUserDataDependingOnGender(values),
			})
		);
	};

	return (
		<KeyboardAwareScrollView
			enableOnAndroid
			extraHeight={0}
			contentContainerStyle={styles.scrollContainer}
		>
			<Box
				width="100%"
				height="100%"
				alignItems="center"
				justifyContent="center"
				backgroundColor="white"
				pb={8}
			>
				<Box style={styles.logo}>
					<LogoIcon />
				</Box>
				<Text marginTop={3} style={styles.welcomeTitle}>
					Welcome to the RTree app!
				</Text>
				<Text style={styles.askInfoAbout}>Please specify some information about you</Text>
				<Formik initialValues={initialValues} validationSchema={signUpSchema} onSubmit={onSubmit}>
					{props => (
						<>
							<Box alignItems="center" justifyContent="center" mt={15} mb={5} width="100%">
								<Box width="90%">
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
									{(props.values.gender.toLocaleLowerCase() === 'female' ||
										props.values.gender.toLocaleLowerCase() === 'non-binary') && (
										<CustomTextInput
											title="Maiden Name"
											placeholder="Maiden Name"
											onChange={props.handleChange('maidenName')}
											value={props.values.maidenName}
											error={
												props.touched.maidenName && props.errors.maidenName
													? props.errors.maidenName
													: null
											}
											onBlur={props.handleBlur('maidenName')}
										/>
									)}
									<CustomTextInput
										title="Your birth date:"
										IconLeft={CalendarIcon}
										type={InputType.date}
										placeholder="Birth date"
										marginTop={2}
										marginTopErrorLabel={-8}
										marginBottomErrorLabel={0}
										onChange={props.handleChange('birthdate')}
										value={props.values.birthdate}
										error={
											props.touched.birthdate && props.errors.birthdate
												? props.errors.birthdate
												: null
										}
										onBlur={props.handleBlur('birthdate')}
									/>
									<CustomTextInput
										dropdownIcon
										title="Gender"
										type={InputType.gender}
										placeholder="Gender"
										marginTop={2}
										marginTopErrorLabel={-8}
										marginBottomErrorLabel={0}
										onChange={props.handleChange('gender')}
										value={props.values.gender}
										error={props.touched.gender && props.errors.gender ? props.errors.gender : null}
										onBlur={props.handleBlur('gender')}
									/>
								</Box>
							</Box>
							<CustomButton onPress={props.handleSubmit} title="Save" />
						</>
					)}
				</Formik>
			</Box>
		</KeyboardAwareScrollView>
	);
};

export default WelcomeScreen;
