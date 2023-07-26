const capitalizeFirstLetter = (word: string) => {
	if (word?.length) return word[0].toUpperCase() + word.substring(1);
};

export {capitalizeFirstLetter};
