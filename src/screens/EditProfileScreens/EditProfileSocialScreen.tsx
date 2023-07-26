import React, {FC, useState, useEffect} from 'react';

import {Alert} from 'react-native';

import {useSelector} from 'react-redux';
import {Formik} from 'formik';
import {Box} from 'native-base';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import {
	facebookSocialLinkSelector,
	instagramSocialLinkSelector,
	linkedinSocialLinkSelector,
	twitterSocialLinkSelector,
	updateUserByIdAsync,
	userSelector,
} from '~redux/slices/user';

import {useAppDispatch} from '~hooks/redux';

import {CustomTextInput, CustomButton} from '~shared';
import {useNavigation} from '@react-navigation/native';

import styles from './styles';

type InitialValues = {
	Facebook: string;
	Instagram: string;
	Twitter: string;
	Linkedin: string;
};

const EditProfileBasicInfoScreen: FC = () => {
	const dispatch = useAppDispatch();

	const user = useSelector(userSelector.getUser);

	const facebookSocialLink = useSelector(facebookSocialLinkSelector);
	const instagramSocialLink = useSelector(instagramSocialLinkSelector);
	const twitterSocialLink = useSelector(twitterSocialLinkSelector);
	const linkedinSocialLink = useSelector(linkedinSocialLinkSelector);
	const [socialNetworks, setSocialNetworks] = useState<InitialValues>();
	const [saving, setSaving] = useState(false);
	const navigation = useNavigation();

	useEffect(
		() =>
			navigation.addListener('beforeRemove', e => {
				if (saving) {
					return;
				}

				const facebookInputNotChanged = socialNetworks?.Facebook === facebookSocialLink?.link;
				const instagramInputNotChanged = socialNetworks?.Instagram === instagramSocialLink?.link;
				const twitterInputNotChanged = socialNetworks?.Twitter === twitterSocialLink?.link;
				const linkedinInputNotChanged = socialNetworks?.Linkedin === linkedinSocialLink?.link;

				if (
					![
						facebookInputNotChanged,
						instagramInputNotChanged,
						twitterInputNotChanged,
						linkedinInputNotChanged,
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
			facebookSocialLink?.link,
			instagramSocialLink?.link,
			linkedinSocialLink?.link,
			navigation,
			saving,
			socialNetworks?.Facebook,
			socialNetworks?.Instagram,
			socialNetworks?.Linkedin,
			socialNetworks?.Twitter,
			twitterSocialLink?.link,
		]
	);

	const InitialValues: InitialValues = {
		Facebook: facebookSocialLink?.link,
		Instagram: instagramSocialLink?.link,
		Twitter: twitterSocialLink?.link,
		Linkedin: linkedinSocialLink?.link,
	};

	const onSubmit = async (values: InitialValues): Promise<void> => {
		await setSaving(true);
		await dispatch(
			updateUserByIdAsync({
				userId: user?.data?.id,
				userData: {
					socialNetworks: [
						{
							name: 'Facebook',
							link: values.Facebook,
						},
						{
							name: 'Instagram',
							link: values.Instagram,
						},
						{
							name: 'Twitter',
							link: values.Twitter,
						},
						{
							name: 'Linkedin',
							link: values.Linkedin,
						},
					],
				},
			})
		);
		navigation.goBack();
	};

	return (
		<KeyboardAwareScrollView contentContainerStyle={styles.socialScreenScrollContainer}>
			<Formik initialValues={InitialValues} onSubmit={onSubmit}>
				{props => {
					setSocialNetworks(props.values);
					return (
						<>
							<Box flex={1} alignItems="center" justifyContent="space-between" mt={8} pb={4}>
								<Box width="90%">
									<CustomTextInput
										title="Facebook"
										placeholder="Enter Facebook Link"
										onChange={props.handleChange('Facebook')}
										value={props.values.Facebook}
										error={
											props.touched.Facebook &&
											props.errors.Facebook &&
											typeof props.errors.Facebook === 'string'
												? props.errors.Facebook
												: null
										}
										onBlur={props.handleBlur('Facebook')}
									/>
									<CustomTextInput
										title="Instagram"
										placeholder="Enter Instagram Link"
										onChange={props.handleChange('Instagram')}
										value={props.values.Instagram}
										error={
											props.touched.Instagram &&
											props.errors.Instagram &&
											typeof props.errors.Instagram === 'string'
												? props.errors.Instagram
												: null
										}
										onBlur={props.handleBlur('Instagram')}
									/>
									<CustomTextInput
										title="LinkedIn"
										placeholder="Enter LinkedIn Link"
										onChange={props.handleChange('Linkedin')}
										value={props.values.Linkedin}
										error={
											props.touched.Linkedin &&
											props.errors.Linkedin &&
											typeof props.errors.Linkedin === 'string'
												? props.errors.Linkedin
												: null
										}
										onBlur={props.handleBlur('Linkedin')}
									/>
									<CustomTextInput
										title="Twitter"
										placeholder="Enter Twitter Link"
										onChange={props.handleChange('Twitter')}
										value={props.values.Twitter}
										error={
											props.touched.Twitter &&
											props.errors.Twitter &&
											typeof props.errors.Twitter === 'string'
												? props.errors.Twitter
												: null
										}
										onBlur={props.handleBlur('Twitter')}
									/>
								</Box>
								<CustomButton onPress={props.handleSubmit} title={'Save changes'} />
							</Box>
						</>
					);
				}}
			</Formik>
		</KeyboardAwareScrollView>
	);
};

export default EditProfileBasicInfoScreen;
