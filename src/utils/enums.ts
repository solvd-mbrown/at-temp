// User tree actions in the ActionSheet
enum TreeMemberActionSheetOptions {
	ViewMembersTree = "View member's tree",
	DeleteTreeMember = 'Delete User',
	AddChild = 'Add Child',
	AddParent = 'Add Parent',
	AddSpouse = 'Add Spouse/Partner',
	AddSiblings = 'Add Sibling',
	Invite = 'Invite',
}

// User relation in the tree
enum TreeRelations {
	Descendant = 'DESCENDANT',
	Married = 'MARRIED',
	MarriedSubtree = 'MARRIEDSUBTREE',
}

// Tree types
enum TreeTypes {
	MainTree = 'bottomPartTree', // * Main tree with logged in user
	FatherAncestryTreeLine = 'rootPartTree',
	MotherAncestryTreeLine = 'subTree',
}

enum InputType {
	gender = 'gender',
	date = 'date',
	zip = 'zip',
	phone = 'phone',
}

enum QuestionnaireCases {
	AddSpouse = 'AddSpouse',
	AddChildren = 'AddChildren',
	AddParent1 = 'AddParent1',
	AddParent2 = 'AddParent2',
	AddSiblings = 'AddSiblings',
	AddParent1GrandParent1 = 'AddParent1GrandParent1',
	AddParent1GrandParent2 = 'AddParent1GrandParent2',
	AddParent2GrandParent1 = 'AddParent2GrandParent1',
	AddParent2GrandParent2 = 'AddParent2GrandParent2',
}

export {TreeMemberActionSheetOptions, TreeRelations, TreeTypes, InputType, QuestionnaireCases};
