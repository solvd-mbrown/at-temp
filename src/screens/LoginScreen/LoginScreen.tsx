import React, {useEffect} from 'react';

import {Alert} from 'react-native';

import {Box, Text} from 'native-base';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {
	GoogleSignin,
	GoogleSigninButton,
	statusCodes,
} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {LogoIcon} from '~shared/Icons';
import {storeAuthToken, WEB_CLIENT_ID} from '~utils';
import {signInUser} from '~redux/slices/auth';

import styles from './styles';

const LoginScreen = () => {
	const dispatch = useDispatch();

	useEffect(() => {
		GoogleSignin.configure({
			scopes: ['email'], // what API you want to access on behalf of the user, default is email and profile
			// client ID of type WEB for your server (needed to verify user ID and offline access)
			webClientId: WEB_CLIENT_ID,
			offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
		});
	}, []);

	const onGoogleButtonPress = async (): Promise<FirebaseAuthTypes.UserCredential | undefined> => {
		try {
			// Check if your device supports Google Play
			await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
			// Get the users ID token
			const {idToken} = await GoogleSignin.signIn();

			// Create a Google credential with the token
			const googleCredential = auth.GoogleAuthProvider.credential(idToken);

			// Sign-in the user with the credential
			const authResponse = auth().signInWithCredential(googleCredential);
			return authResponse;
		} catch (error: any) {
			console.log('error :>> ', error);
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				// user cancelled the login flow
				Alert.alert('Cancel');
			} else if (error.code === statusCodes.IN_PROGRESS) {
				Alert.alert('Signin in progress');
				// operation (f.e. sign in) is in progress already
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				Alert.alert('PLAY_SERVICES_NOT_AVAILABLE');
				// play services not available or outdated
			} else {
				// some other error happened
				Alert.alert('SOME_UNUSUAL_ERROR_HAPPENED');
				console.log('error :>> ', error);
			}
		}
	};

	const onAuthStateChanged = async (userAuth: FirebaseAuthTypes.User | null) => {
		if (!userAuth) {
			return;
		}
		if (userAuth) {
			try {
				const currentUser = auth().currentUser;
				if (currentUser) {
					const userToken = await currentUser.getIdToken(true);
					await storeAuthToken(userToken);
					if (currentUser?.email) {
						const payload = {email: currentUser.email};
						dispatch(signInUser(payload));
					}
				}
			} catch (error) {
				console.log('error :>> ', error);
			}
		}
	};

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return () => {
			subscriber;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onGoogleSigninButton = () =>
		onGoogleButtonPress().then(() => console.log('Signed in with Google!'));

	return (
		<Box width="100%">
			<Box style={styles.logo}>
				<LogoIcon />
			</Box>
			<Text style={styles.signInTitle}>Sign In</Text>

			<Box alignItems="center">
				<GoogleSigninButton
					style={styles.socialButton}
					size={GoogleSigninButton.Size.Wide}
					color={GoogleSigninButton.Color.Dark}
					onPress={onGoogleSigninButton}
				/>
			</Box>
		</Box>
	);
};

export default LoginScreen;
