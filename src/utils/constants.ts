import {QuestionnaireSettings} from '~types/QuestionnaireSettings';

const BASE_URL = 'https://server.arrtree.com';
const HELP_URL = 'https://arrtree.notion.site/Help-Center-ddd5196c57c44d719064d713dbdb3bf4';

const RECIPIENTEMAIL = 'feedback.arrtree@gmail.com';

const WEB_CLIENT_ID = '23213938962-nk6hm48deuarb2bqae4rffut9u1jofom.apps.googleusercontent.com';

const QUESTIONNAIRE_SETTINGS: QuestionnaireSettings = Object.freeze({
	isUserUpdatedOnWelcomeScreen: false,
	isSkipped: false,
	isCompleted: false,
	doNotShowQuestionnaireModal: false,
	skipStep4_AddSiblings: false,
	skipStep5_AddParent1GrandParents: false,
	skipStep6_AddParent2GrandParents: false,
	step1_AddSpouse: {
		isStep1Completed: false,
	},
	step2_AddChildren: {
		isStep2Completed: false,
	},
	step3_AddParents: {
		isParent1Added: false,
		isParent2Added: false,
		isStep3Completed: false,
	},
	step4_AddSiblings: {
		isStep4Completed: false,
	},
	step5_AddParent1GrandParents: {
		isGrandParent1Added: false,
		isGrandParent2Added: false,
		isStep5Completed: false,
	},
	step6_AddParent2GrandParents: {
		isGrandParent1Added: false,
		isGrandParent2Added: false,
		isStep6Completed: false,
	},
	step7_ExtraQuestions: {
		isStep7Completed: false,
	},
});

const STATES = [
	'None',
	'Alaska',
	'Alabama',
	'Arkansas',
	'American Samoa',
	'Arizona',
	'California',
	'Colorado',
	'Connecticut',
	'District of Columbia',
	'Delaware',
	'Florida',
	'Georgia',
	'Guam',
	'Hawaii',
	'Iowa',
	'Idaho',
	'Illinois',
	'Indiana',
	'Kansas',
	'Kentucky',
	'Louisiana',
	'Massachusetts',
	'Maryland',
	'Maine',
	'Michigan',
	'Minnesota',
	'Missouri',
	'Mississippi',
	'Montana',
	'North Carolina',
	'North Dakota',
	'Nebraska',
	'New Hampshire',
	'New Jersey',
	'New Mexico',
	'Nevada',
	'New York',
	'Ohio',
	'Oklahoma',
	'Oregon',
	'Pennsylvania',
	'Puerto Rico',
	'Rhode Island',
	'South Carolina',
	'South Dakota',
	'Tennessee',
	'Texas',
	'Utah',
	'Virginia',
	'Virgin Islands',
	'Vermont',
	'Washington',
	'Wisconsin',
	'West Virginia',
	'Wyoming',
];

export {BASE_URL, HELP_URL, RECIPIENTEMAIL, WEB_CLIENT_ID, QUESTIONNAIRE_SETTINGS, STATES};
