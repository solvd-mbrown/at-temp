import 'react-native-gesture-handler';
import React from 'react';

import {Provider} from 'react-redux';
import {NativeBaseProvider} from 'native-base';
import {ActionSheetProvider} from '@expo/react-native-action-sheet';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import store from '~redux/store';
import AppNavigator from '~navigation/AppNavigator';

export default function App() {
	return (
		<Provider store={store}>
			<ActionSheetProvider>
				<SafeAreaProvider>
					<NativeBaseProvider>
						<AppNavigator />
					</NativeBaseProvider>
				</SafeAreaProvider>
			</ActionSheetProvider>
		</Provider>
	);
}
