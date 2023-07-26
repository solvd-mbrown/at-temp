import React, {useState} from 'react';

import {useWindowDimensions} from 'react-native';

import {Box, Text} from 'native-base';
import {
	TabView,
	SceneMap,
	TabBar,
	NavigationState,
	SceneRendererProps,
} from 'react-native-tab-view';

import {PersonalInfo, FamilyMembersList, PostList} from '~shared';

import styles from './styles';

const FirstRoute = () => <PersonalInfo />;
const SecondRoute = () => <PostList myPosts />;
const ThirdRoute = () => <FamilyMembersList />;

type Route = {
	key: string;
	title: string;
};

type State = NavigationState<Route>;
type Label = {
	focused: boolean;
	route: Route;
};

const renderTabBar = (props: SceneRendererProps & {navigationState: State}) => (
	<TabBar
		{...props}
		scrollEnabled={true}
		renderLabel={({focused, route}: Label) => (
			<>
				<Text style={[styles.title, focused && styles.focused]}>{route.title}</Text>
				<Box style={styles.box}>
					<Text style={styles.line}>{route.title}</Text>
				</Box>
			</>
		)}
		activeColor="#252A31"
		inactiveColor="#252A31"
		style={styles.tabBarContainer}
		tabStyle={styles.tab}
		indicatorStyle={styles.indicator}
	/>
);

const renderScene = SceneMap({
	first: FirstRoute,
	second: SecondRoute,
	third: ThirdRoute,
});

const Tabs = () => {
	const layout = useWindowDimensions();

	const [index, setIndex] = useState<number>(0);
	const [routes] = useState<Route[]>([
		{key: 'first', title: 'Personal Info'},
		{key: 'second', title: 'My Posts'},
		{key: 'third', title: 'Family Members'},
	]);

	return (
		<TabView
			swipeEnabled={false}
			navigationState={{index, routes}}
			renderScene={renderScene}
			onIndexChange={setIndex}
			renderTabBar={renderTabBar}
			initialLayout={{width: layout.width}}
			sceneContainerStyle={styles.sceneContainer}
		/>
	);
};

export {Tabs};
