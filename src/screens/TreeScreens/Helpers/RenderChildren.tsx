import React, {ReactNode} from 'react';

import {HStack, Box} from 'native-base';
import Svg, {Line} from 'react-native-svg';

import dayjs from 'dayjs';

import {ITreeMemberDescendant} from '~interfaces/ITreeMemberDescendant';
import {TreePart} from '~types/TreePart';
import {TreeTypes} from '~utils';

import treeStyles from '../treeStyles';

const renderChildren = (
	childrenData: TreePart,
	hasChildren: boolean,
	renderTree: (
		treeData: TreePart,
		treeType: TreeTypes,
		level: number,
		parentIdentity?: string
	) => ReactNode,
	treeType: TreeTypes,
	level: number,
	strokeWidth: number,
	pathColor: string,
	parentIdentity?: string
) => {
	const children = [...childrenData]?.sort(
		(a, b) =>
			dayjs(a.user?.properties.birthdate).valueOf() - dayjs(b.user?.properties.birthdate).valueOf()
	);
	return children?.map((child: ITreeMemberDescendant, index: number): ReactNode => {
		return (
			<HStack
				key={`${child?.user?.properties?.firstName} + ${child?.user?.properties?.lastName} + ${child?.user?.identity} + ${index} + ${level}`}
			>
				<Box>
					{/* NOTE: * increase height from 25/26 to 30-32 */}
					<Svg
						height={hasChildren && children.length > 1 ? '30' : '0'}
						width="100%"
						style={treeStyles.alignSelfCenter}
					>
						{/* Top side vertical line */}
						<Line x1="50%" y1="0" x2="50%" y2="100%" stroke={pathColor} strokeWidth={strokeWidth} />
						{
							//Right side horizontal line
							hasChildren && children.length != 1 && children.length - 1 !== index && (
								<Line
									x1="100%"
									y1={strokeWidth / 2}
									x2="50%"
									y2={strokeWidth / 2}
									stroke={pathColor}
									strokeWidth={strokeWidth}
								/>
							)
						}
						{
							// Left side horizontal line
							hasChildren && children.length != 1 && index !== 0 && (
								<Line
									x1="50%"
									y1={strokeWidth / 2}
									x2="0"
									y2={strokeWidth / 2}
									stroke={pathColor}
									strokeWidth={strokeWidth}
								/>
							)
						}
					</Svg>
					{renderTree([child], treeType, level + 1, parentIdentity)}
				</Box>
			</HStack>
		);
	});
};

export {renderChildren};
