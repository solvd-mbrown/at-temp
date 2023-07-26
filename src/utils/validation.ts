import * as yup from 'yup';

const treeModalSchema = yup.object({
	firstName: yup
		.string()
		.trim('The first name cannot include leading and trailing spaces')
		.strict(true)
		.required('First Name is required')
		.min(1, 'Minimum 1 symbols'),
	lastName: yup
		.string()
		.trim('The last name cannot include leading and trailing spaces')
		.strict(true)
		.min(1, 'Minimum 1 symbol'),
	gender: yup.string().required('Select gender'),
});

const emailSchema = yup.object({
	email: yup.string().email('Email is not valid').required('Email is required'),
});

const userNameSchema = yup.object({
	firstName: yup
		.string()
		.trim('The first name cannot include leading and trailing spaces')
		.strict(true)
		.required('First Name is required')
		.min(1, 'Minimum 1 symbols'),
	lastName: yup
		.string()
		.trim('The last name cannot include leading and trailing spaces')
		.strict(true)
		.min(1, 'Minimum 1 symbol'),
	maidenName: yup
		.string()
		.trim('The maiden name cannot include leading and trailing spaces')
		.strict(true)
		.min(1, 'Minimum 1 symbol'),
});

const signUpSchema = yup.object({
	firstName: yup
		.string()
		.trim('The first name cannot include leading and trailing spaces')
		.strict(true)
		.required('First Name is required')
		.min(1, 'Minimum 1 symbols'),
	lastName: yup
		.string()
		.trim('The Last name cannot include leading and trailing spaces')
		.strict(true)
		.required('Last Name is required')
		.min(1, 'Minimum 1 symbol'),
	maidenName: yup
		.string()
		.trim('The maiden name cannot include leading and trailing spaces')
		.strict(true)
		.min(1, 'Minimum 1 symbol'),
	birthdate: yup.string().required('Birth date is required'),
	gender: yup.string().required('Select gender'),
});

const spouseDetailsSchema = (married: string) =>
	married !== 'no' &&
	yup.object({
		firstName: yup
			.string()
			.trim('The first name cannot include leading and trailing spaces')
			.strict(true)
			.required('First Name is required')
			.min(1, 'Minimum 1 symbols'),
		lastName: yup
			.string()
			.trim('The last name cannot include leading and trailing spaces')
			.strict(true)
			.required('Last Name is required')
			.min(1, 'Minimum 1 symbols'),
		gender: yup.string().required('Select gender'),
		birthdate: yup.string(),
		dateOfDeath: yup.string(),
	});

const parentDetailsSchema = yup.object({
	firstName: yup
		.string()
		.trim('The first name cannot include leading and trailing spaces')
		.strict(true)
		.required('First Name is required')
		.min(1, 'Minimum 1 symbols'),
	lastName: yup
		.string()
		.trim('The last name cannot include leading and trailing spaces')
		.strict(true)
		.required('Last Name is required')
		.min(1, 'Minimum 1 symbols'),
	gender: yup.string().required('Select gender'),
	birthdate: yup.string(),
	dateOfDeath: yup.string(),
});

const childrenSiblingSchema = yup.object({
	firstName: yup
		.string()
		.trim('The first name cannot include leading and trailing spaces')
		.strict(true)
		.required('First Name is required')
		.min(1, 'Minimum 1 symbols'),
	lastName: yup
		.string()
		.trim('The last name cannot include leading and trailing spaces')
		.strict(true)
		.required('Last Name is required')
		.min(1, 'Minimum 1 symbols'),
	gender: yup.string().required('Select gender'),
	birthdate: yup.string(),
	dateOfDeath: yup.string(),
});

const extraDetailsSchema = (employed?: string) =>
	yup.object({
		birthPlace: yup
			.string()
			.trim('The birth information cannot include leading and trailing spaces')
			.strict(true)
			.required('Birth information is required')
			.min(1, 'Minimum 1 symbols'),
		city: yup
			.string()
			.trim('The city cannot include leading and trailing spaces')
			.strict(true)
			.required('City is required')
			.min(1, 'Minimum 1 symbols'),
		zip: yup
			.string()
			.trim('The zip cannot include leading and trailing spaces')
			.strict(true)
			.min(1, 'Minimum 1 symbols'),
		state: yup.string().required('State is required').min(1, 'Minimum 1 symbols'),
		employerAndPosition:
			employed === 'yes'
				? yup.string().required('Employment information is required').min(1, 'Minimum 1 symbols')
				: yup.string(),
	});

export {
	treeModalSchema,
	emailSchema,
	userNameSchema,
	signUpSchema,
	spouseDetailsSchema,
	childrenSiblingSchema,
	parentDetailsSchema,
	extraDetailsSchema,
};
