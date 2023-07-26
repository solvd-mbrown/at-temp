import {IRelative} from '~interfaces/IRelative';
import {QuestionnaireCases, TreeMemberActionSheetOptions, TreeRelations} from '~utils';

type addUserToTreeData = {
	userId: string;
	toUserId: string;
	relation: TreeRelations;
};

const getAddRelativeToTreeInUserProfileBodyData = (
	userId: string,
	newUserId: string,
	addRelativeActionSheetOption: TreeMemberActionSheetOptions,
	parents?: IRelative[],
	firstParentId?: string
): addUserToTreeData => {
	// * default add child case
	let addUserToTreeData = {
		userId: newUserId,
		toUserId: userId,
		relation: TreeRelations.Descendant,
	};

	if (addRelativeActionSheetOption === TreeMemberActionSheetOptions.AddParent) {
		// * Add second parent — spouse of first parent
		if (parents?.length === 1 && firstParentId) {
			addUserToTreeData = {
				userId: newUserId,
				toUserId: firstParentId,
				relation: TreeRelations.Married,
			};
		} else {
			// * Add first parent
			addUserToTreeData = {
				userId: userId,
				toUserId: newUserId,
				relation: TreeRelations.Descendant,
			};
		}
	}
	if (addRelativeActionSheetOption === TreeMemberActionSheetOptions.AddSpouse) {
		addUserToTreeData = {
			userId: newUserId,
			toUserId: userId,
			relation: TreeRelations.Married,
		};
	}
	if (
		addRelativeActionSheetOption === TreeMemberActionSheetOptions.AddSiblings &&
		parents &&
		parents.length > 0 &&
		firstParentId
	) {
		addUserToTreeData = {
			userId: newUserId,
			toUserId: firstParentId,
			relation: TreeRelations.Descendant,
		};
	}

	return addUserToTreeData;
};

const getAddRelativeToTreeInQuestionnaireBodyData = (
	userId: string,
	newUserId: string,
	questionnaireCase: QuestionnaireCases,
	parents?: IRelative[],
	firstParentId?: string
): addUserToTreeData => {
	let addUserToTreeData = {
		userId: newUserId,
		toUserId: userId,
		relation: TreeRelations.Descendant,
	};

	// * Add Spouse
	if (questionnaireCase === QuestionnaireCases.AddSpouse) {
		// TODO: remove log
		console.log('case 0 :>> ');
		addUserToTreeData = {
			userId: newUserId,
			toUserId: userId,
			relation: TreeRelations.Married,
		};
	}

	// * Add Parents and Parent1 GrandParents
	if (
		questionnaireCase === QuestionnaireCases.AddParent1 ||
		questionnaireCase === QuestionnaireCases.AddParent1GrandParent1
	) {
		if (parents?.length === 1 && firstParentId) {
			// TODO: remove log
			console.log('case 1_1 AddParent as Spouse:>> ');
			addUserToTreeData = {
				userId: newUserId,
				toUserId: firstParentId,
				relation: TreeRelations.Married,
			};
		}
		if (!parents?.length || parents?.length === 0) {
			// TODO: remove log
			console.log('case 1_2 AddParent:>> ');
			addUserToTreeData = {
				userId: userId,
				toUserId: newUserId,
				relation: TreeRelations.Descendant,
			};
		}
	}

	// * Add Parent2 GrandParents
	if (questionnaireCase === QuestionnaireCases.AddParent2GrandParent1) {
		// * Add second GrandParent
		if (parents?.length === 1 && firstParentId) {
			// TODO: remove log
			console.log('case 2_1 AddParent2GrandParent1:>> ');
			addUserToTreeData = {
				userId: newUserId,
				toUserId: firstParentId,
				relation: TreeRelations.Married,
			};
		} else {
			// * Add first GrandParent
			// TODO: remove log
			console.log('case 2_2 AddParent2GrandParent1:>> ');
			addUserToTreeData = {
				userId: userId,
				toUserId: newUserId,
				relation: TreeRelations.MarriedSubtree,
			};
		}
	}

	if (
		questionnaireCase === QuestionnaireCases.AddSiblings &&
		parents &&
		parents.length > 0 &&
		firstParentId
	) {
		addUserToTreeData = {
			userId: newUserId,
			toUserId: firstParentId,
			relation: TreeRelations.Descendant,
		};
	}

	return addUserToTreeData;
};

export {getAddRelativeToTreeInUserProfileBodyData, getAddRelativeToTreeInQuestionnaireBodyData};
