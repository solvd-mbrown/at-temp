import React, {ReactNode} from 'react';

import {Line} from 'react-native-svg';

import {TreeTypes} from '~utils';
import {PathColor} from '~types/PathColor';

const getVerticalTopLineColorOfTreeMember = (
	isRootMember: boolean,
	shouldSwapSubTreeAndRootTree: boolean,
	shouldRenderRootTree: boolean,
	shouldRenderSubTree: boolean,
	isDescendantOrSpouse: boolean,
	spouseCase: boolean,
	treeType: TreeTypes,
	isSpouseOfAuthUser: boolean,
	pathColor: PathColor
): PathColor | 'white' | undefined => {
	if (treeType === TreeTypes.MainTree) {
		if (isRootMember) {
			if (!shouldSwapSubTreeAndRootTree) {
				if (spouseCase) {
					if (shouldRenderSubTree) {
						if (isSpouseOfAuthUser) {
							return 'white';
						}
						return pathColor;
					}
				} else if (shouldRenderRootTree) {
					return pathColor;
				}
			}
			if (shouldSwapSubTreeAndRootTree) {
				if (spouseCase) {
					if (shouldRenderRootTree) {
						return pathColor;
					}
				} else if (shouldRenderSubTree) {
					if (isSpouseOfAuthUser) {
						return 'white';
					}
					return pathColor;
				}
			}
		} else if (isDescendantOrSpouse) {
			return pathColor;
		} else {
			return 'white';
		}
	} else {
		return 'white';
	}
};

const getHorizontalLinesFromTopTreesToMainTree = (
	shouldSwapSubTreeAndRootTree: boolean,
	treeType: TreeTypes,
	strokeWidth: number,
	pathColor: PathColor,
	isRootInMainTreeHasNoSpouse: boolean
): ReactNode => {
	if (shouldSwapSubTreeAndRootTree) {
		return treeType === TreeTypes.FatherAncestryTreeLine ? (
			<Line
				x1="51.5%"
				y1={strokeWidth / 2}
				x2={'20%'}
				y2={strokeWidth / 2}
				stroke={pathColor}
				strokeWidth={strokeWidth}
			/>
		) : (
			<Line
				x1="80%"
				y1={strokeWidth / 2}
				x2="49%"
				y2={strokeWidth / 2}
				stroke={pathColor}
				strokeWidth={strokeWidth}
			/>
		);
	} else {
		return treeType === TreeTypes.FatherAncestryTreeLine ? (
			<Line
				x1={isRootInMainTreeHasNoSpouse ? '100%' : '80%'}
				y1={strokeWidth / 2}
				x2={isRootInMainTreeHasNoSpouse ? '49.2%' : '49%'}
				y2={strokeWidth / 2}
				stroke={pathColor}
				strokeWidth={strokeWidth}
			/>
		) : (
			<Line
				x1={isRootInMainTreeHasNoSpouse ? '49%' : '51%'}
				y1={strokeWidth / 2}
				x2={'20%'}
				y2={strokeWidth / 2}
				stroke={pathColor}
				strokeWidth={strokeWidth}
			/>
		);
	}
};

const getTopHorizontalLineOfSpouse = (
	isRootMember: boolean,
	isDescendantOrSpouse: boolean,
	treeType: TreeTypes,
	strokeWidth: number,
	pathColor: PathColor,
	shouldSwapSubTreeAndRootTree: boolean,
	shouldRenderRootTree: boolean,
	shouldRenderSubTree: boolean,
	isSpouseOfAuthUser: boolean
): ReactNode => {
	const getStrokeColor = (): PathColor | 'white' => {
		if (isDescendantOrSpouse) {
			if (shouldSwapSubTreeAndRootTree && !shouldRenderRootTree && isRootMember) {
				return 'white';
			}
			return pathColor;
		} else {
			if (isRootMember && isSpouseOfAuthUser) {
				return 'white';
			}
			if (!isRootMember) {
				return 'white';
			}
			if (shouldSwapSubTreeAndRootTree && !shouldRenderSubTree) {
				return pathColor;
			}
			if (!shouldSwapSubTreeAndRootTree && !shouldRenderSubTree) {
				return 'white';
			}
			return pathColor;
		}
	};
	return (
		treeType === TreeTypes.MainTree && (
			<Line
				x1={!isRootMember ? '50%' : '100%'}
				y1={strokeWidth / 2}
				x2={!isRootMember ? 0 : '50%'}
				y2={strokeWidth / 2}
				stroke={getStrokeColor()}
				strokeWidth={strokeWidth}
			/>
		)
	);
};

const getTopHorizontalLineOfDescendant = (
	isRootMember: boolean,
	isMarried: boolean,
	isDescendantOrSpouse: boolean,
	treeType: TreeTypes,
	strokeWidth: number,
	pathColor: PathColor,
	shouldSwapSubTreeAndRootTree: boolean,
	shouldRenderRootTree: boolean,
	shouldRenderSubTree: boolean,
	isSpouseOfAuthUser: boolean
): ReactNode => {
	const getStrokeColor = (): PathColor | 'white' => {
		if (isDescendantOrSpouse) {
			if (!shouldSwapSubTreeAndRootTree && !shouldRenderRootTree && isRootMember) {
				return 'white';
			}
			return pathColor;
		} else {
			if (isRootMember && isSpouseOfAuthUser) {
				return 'white';
			}
			if (!isRootMember) {
				return 'white';
			} else {
				if (shouldSwapSubTreeAndRootTree && !shouldRenderSubTree) {
					return 'white';
				}
			}
			return pathColor;
		}
	};
	if (treeType === TreeTypes.MainTree && isMarried) {
		return (
			<Line
				x1={!isRootMember ? '100%' : '50%'}
				y1={strokeWidth / 2}
				x2={!isRootMember ? '50%' : 0}
				y2={strokeWidth / 2}
				stroke={getStrokeColor()}
				strokeWidth={strokeWidth}
			/>
		);
	} else {
		return (
			treeType === TreeTypes.MainTree &&
			isRootMember && (
				<Line
					x1={'50%'}
					y1={strokeWidth / 2}
					x2={0}
					y2={strokeWidth / 2}
					stroke={getStrokeColor()}
					strokeWidth={strokeWidth}
				/>
			)
		);
	}
};

export {
	getVerticalTopLineColorOfTreeMember,
	getHorizontalLinesFromTopTreesToMainTree,
	getTopHorizontalLineOfSpouse,
	getTopHorizontalLineOfDescendant,
};
