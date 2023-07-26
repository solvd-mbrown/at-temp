import React from 'react';

import {TouchableOpacity} from 'react-native';
import {Box, Text, HStack} from 'native-base';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

import {userSelector} from '~redux/slices/user';
import {RouteStackList, StackNavigationPropsWithParams} from '~types/NavigationTypes';

import {EditProfileIcon} from '~shared';

import styles from './styles';

const SubSectionList = () => {
	const user = useSelector(userSelector.getUser);
	const navigation =
		useNavigation<StackNavigationPropsWithParams<RouteStackList.EditIntroductionListScreen>>();

	const userData = user?.data;

	const subSectionsTitle = ['intro', 'experiences', 'other'];

	const onPress =
		(subSectionTitle: string): (() => void) =>
		() =>
			navigation.navigate(RouteStackList.EditIntroductionListScreen, {
				userId: userData?.id,
				sectionType: subSectionTitle,
			});

	return (
		<Box style={styles.subSectionsWrapper}>
			{subSectionsTitle.map((subSectionTitle, index) => (
				<HStack alignItems="center" marginBottom={1} key={subSectionTitle + index}>
					<Text fontSize={16}>{`${index + 1}. `}</Text>
					<TouchableOpacity onPress={onPress(subSectionTitle)}>
						<HStack alignItems="center">
							<Text fontSize={16}>
								{`${subSectionTitle.charAt(0).toUpperCase() + subSectionTitle.slice(1)}  `}
							</Text>
							<EditProfileIcon
								userId={userData?.id}
								sectionType={subSectionTitle}
								navigationTarget={'EditIntroductionListScreen'}
							/>
						</HStack>
					</TouchableOpacity>
				</HStack>
			))}
		</Box>
	);
};

export default SubSectionList;
