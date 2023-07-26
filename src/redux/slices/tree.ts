import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import get from 'lodash/get';

import api from '~api/api';
import {TreeMemberActionSheetOptions, TreeRelations} from '~utils';
import {
	AddRelativesByTreeIdAsyncPayload,
	GetTreeInPartsByIdAsyncPayload,
	InitializeTreeData,
	UpdateTreeByIdAsyncPayload,
} from '~redux/@types';

import {RootState} from '~redux/store';
import {
	getAddRelativeToTreeInQuestionnaireBodyData,
	getAddRelativeToTreeInUserProfileBodyData,
} from '~screens/TreeScreens/Helpers/AddRelativeToTreeOutsideOfTreeHelper';

const initialState = {
	treeLoading: false,
	errors: '',
	tree: {
		data: [],
		treeMembersData: [],
		newUserJoinedId: '',
		newTreeData: [],
		treeViewer: null,
	},
};

export const getTreeInPartsByIdAsync = createAsyncThunk<any, GetTreeInPartsByIdAsyncPayload>(
	'tree/getTreeInPartsById',
	async ({treeId, userId}) => {
		const treeResponse = await api.get(`/tree/treeInParts/${treeId}/${userId}`);
		return treeResponse.data;
	}
);

export const createTreeByIdAsync = createAsyncThunk<any, InitializeTreeData>(
	'tree/createTreeById',
	async treeData => {
		const treeResponse = await api.post('/tree/add', treeData);
		return treeResponse.data;
	}
);

// TODO: Check if this request is will be using
export const getTreeMembersByIdAsync = createAsyncThunk<any, string>(
	'tree/getTreeMembersById',
	async treeId => {
		const treeResponse = await api.get(`/tree/members/${treeId}`);
		return treeResponse.data;
	}
);

// * Add user (user should already exist) to tree
export const updateTreeByIdAsync = createAsyncThunk<any, UpdateTreeByIdAsyncPayload>(
	'tree/updateTreeById',
	async ({
		treeId,
		toUserId,
		newUserId,
		roleType,
		isRootUser,
		isWifeOfRootUser,
		treeMemberThatHoldsChildren,
	}) => {
		// treeMemberThatHoldsChildren —— holds data about children, also married,
		// Actually it is a descendant not spouse
		// It's' using for adding children to spouse
		// TODO: remove logs
		console.log('treeMemberThatHoldsChildren :>> ', treeMemberThatHoldsChildren);

		let userRelationInTree;
		let bodyData;
		// * First case is adding child to spouse
		if (treeMemberThatHoldsChildren && roleType !== TreeMemberActionSheetOptions.AddParent) {
			console.log('Case 1 Add child to Spouse :>> ');
			bodyData = {
				userId: newUserId,
				toUserId: treeMemberThatHoldsChildren?.user?.identity,
				relation: TreeRelations.Descendant,
			};
		} else if (
			treeMemberThatHoldsChildren &&
			roleType === TreeMemberActionSheetOptions.AddParent &&
			!isWifeOfRootUser
		) {
			console.log('Case 2 add Parents to Spouse :>> ');
			bodyData = {
				userId: toUserId,
				toUserId: newUserId,
				relation: TreeRelations.MarriedSubtree,
			};
		} else {
			userRelationInTree =
				roleType === TreeMemberActionSheetOptions.AddSpouse
					? TreeRelations.Married
					: TreeRelations.Descendant;

			// * Adding parent to root user is adding current root user as a child to new user
			bodyData = {
				userId:
					(isRootUser && roleType === TreeMemberActionSheetOptions.AddParent) ||
					(isWifeOfRootUser && roleType === TreeMemberActionSheetOptions.AddParent)
						? toUserId
						: newUserId,
				toUserId:
					(isRootUser && roleType === TreeMemberActionSheetOptions.AddParent) ||
					(isWifeOfRootUser && roleType === TreeMemberActionSheetOptions.AddParent)
						? newUserId
						: toUserId,
				relation: isWifeOfRootUser ? TreeRelations.MarriedSubtree : userRelationInTree,
			};
		}

		const response = await api.patch(`/tree/jointo/${treeId}`, bodyData);
		if (response?.data?.response === 'done') {
			return newUserId;
		}
	}
);

export const addRelativesByTreeIdAsync = createAsyncThunk<any, AddRelativesByTreeIdAsyncPayload>(
	'tree/addRelativesByTreeId',
	async ({
		treeId,
		userId,
		newUserId,
		addRelativeActionSheetOption,
		parents,
		addRelativeViaModal,
		questionnaireCase,
	}) => {
		let firstParentId: string = '';
		if (parents && parents?.length > 0) {
			firstParentId = parents[0]?.identity;
		}

		// * default add child case
		let bodyData = {
			userId: newUserId,
			toUserId: userId,
			relation: TreeRelations.Descendant,
		};

		if (addRelativeViaModal) {
			bodyData = getAddRelativeToTreeInUserProfileBodyData(
				userId,
				newUserId,
				addRelativeActionSheetOption,
				parents,
				firstParentId
			);
		} else {
			if (questionnaireCase) {
				bodyData = getAddRelativeToTreeInQuestionnaireBodyData(
					userId,
					newUserId,
					questionnaireCase,
					parents,
					firstParentId
				);
			}
		}

		const response = await api.patch(`/tree/jointo/${treeId}`, bodyData);
		if (response?.data?.response === 'done') {
			return;
		}
	}
);

const treeSlice = createSlice({
	name: 'tree',
	initialState,
	reducers: {
		setTreeViewer: (state, {payload}) => {
			state.tree.treeViewer = payload;
		},
		clearTree: state => {
			state.tree = initialState.tree;
		},
	},
	extraReducers: builder => {
		builder
			.addCase(getTreeInPartsByIdAsync.pending, state => {
				state.treeLoading = true;
			})
			.addCase(getTreeInPartsByIdAsync.fulfilled, (state, action) => {
				state.treeLoading = false;
				state.tree.data = action.payload;
			})
			.addCase(getTreeInPartsByIdAsync.rejected, (state, action) => {
				state.treeLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(getTreeMembersByIdAsync.pending, state => {
				state.treeLoading = true;
			})
			.addCase(getTreeMembersByIdAsync.fulfilled, (state, action) => {
				state.treeLoading = false;
				state.tree.treeMembersData = action.payload;
			})
			.addCase(getTreeMembersByIdAsync.rejected, (state, action) => {
				state.treeLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(createTreeByIdAsync.pending, state => {
				state.treeLoading = false;
			})
			.addCase(createTreeByIdAsync.fulfilled, (state, action) => {
				state.treeLoading = false;
				state.tree.newTreeData = action.payload;
			})
			.addCase(createTreeByIdAsync.rejected, (state, action) => {
				state.treeLoading = false;
				state.errors = action.error.message || '';
			})
			.addCase(updateTreeByIdAsync.pending, state => {
				state.treeLoading = true;
			})
			.addCase(updateTreeByIdAsync.fulfilled, (state, action) => {
				state.treeLoading = false;
				state.tree.newUserJoinedId = action.payload;
			})
			.addCase(updateTreeByIdAsync.rejected, (state, action) => {
				state.treeLoading = false;
				state.errors = action.error.message || '';
			});
	},
});

export const {setTreeViewer, clearTree} = treeSlice.actions;

export const treeSelector = {
	getTree: (state: RootState) => ({
		data: get(state.tree, 'tree.data', []) || [],
		treeMembersData: get(state.tree, 'tree.treeMembersData', []) || [],
		newUserJoinedId: get(state.tree, 'tree.newUserJoinedId', '') || '',
		newTreeData: get(state.tree, 'tree.newTreeData', []) || [],
		treeViewer: get(state.tree, 'tree.treeViewer', null) || null,
		isNewUserAddedToAnotherTree: get(state.tree, 'tree.isNewUserAddedToAnotherTree', null) || null,
		spouseThatAddParentToAnotherTree:
			get(state.tree, 'tree.spouseThatAddParentToAnotherTree', null) || null,
	}),
	getTreeLoading: (state: RootState) => state.tree.treeLoading,
	getErrors: (state: RootState) => state.tree.errors,
};

export default treeSlice.reducer;
