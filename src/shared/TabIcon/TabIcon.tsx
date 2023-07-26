import React from 'react';

import NotificationsSVGTabIcon from './TabIcons/NotificationsSVGTabIcon';
import PostSVGTabIcon from './TabIcons/PostSVGTabIcon';
import ProfileSVGTabIcon from './TabIcons/ProfileSVGTabIcon';
import TreeSVGTabIcon from './TabIcons/TreeSVGTabIcon';

type TabIconTypeProps = {
	name: 'tree' | 'posts' | 'profile' | 'notifications';
	focused: boolean;
};

const TabIcon = ({name, focused}: TabIconTypeProps) => {
	switch (name) {
		case 'tree':
			return <TreeSVGTabIcon focused={focused} />;
		case 'posts':
			return <PostSVGTabIcon focused={focused} />;
		case 'profile':
			return <ProfileSVGTabIcon focused={focused} />;
		case 'notifications':
			return <NotificationsSVGTabIcon focused={focused} />;
	}
};

export {TabIcon};
