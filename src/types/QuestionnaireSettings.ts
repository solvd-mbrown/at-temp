export type QuestionnaireSettings = {
	isUserUpdatedOnWelcomeScreen: boolean;
	isSkipped: boolean;
	isCompleted: boolean;
	doNotShowQuestionnaireModal: boolean;
	// Parents are skipped
	skipStep4_AddSiblings: boolean;
	skipStep5_AddParent1GrandParents: boolean;
	skipStep6_AddParent2GrandParents: boolean;
	// Spouse
	step1_AddSpouse: {
		isStep1Completed: boolean;
		formVariants: {
			married: string;
			deceased: string;
			details: string;
		};
	};
	// Children
	step2_AddChildren: {
		isStep2Completed: boolean;
		formVariants: {
			[key: string]: {deceased: string; details: string};
		};
	};
	// Parents
	step3_AddParents: {
		isParent1Added: boolean;
		isParent2Added: boolean;
		isStep3Completed: boolean;
		formVariants: {
			parent1: {
				deceased: string;
				details: string;
			};
			parent2: {
				deceased: string;
				details: string;
			};
		};
	};
	// Siblings
	step4_AddSiblings: {
		isStep4Completed: boolean;
		formVariants: {
			[key: string]: {deceased: string; details: string};
		};
	};
	// Parent1 (Paternal) parents
	step5_AddParent1GrandParents: {
		isGrandParent1Added: boolean;
		isGrandParent2Added: boolean;
		isStep5Completed: boolean;
		formVariants: {
			parent1: {
				deceased: string;
				details: string;
			};
			parent2: {
				deceased: string;
				details: string;
			};
		};
	};
	// Parent2 (Maternal) parents
	step6_AddParent2GrandParents: {
		isGrandParent1Added: boolean;
		isGrandParent2Added: boolean;
		isStep6Completed: boolean;
		formVariants: {
			parent1: {
				deceased: string;
				details: string;
			};
			parent2: {
				deceased: string;
				details: string;
			};
		};
	};
	// Extra questions
	step7_ExtraQuestions: {
		isStep7Completed: boolean;
	};
};
