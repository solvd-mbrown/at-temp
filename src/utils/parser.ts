type Data = string | any[] | any;

const parseStringToJSONdata = (data: Data): Data => {
	try {
		if (data && typeof data === 'string') {
			return JSON.parse(data);
		} else {
			return data;
		}
	} catch (error) {
		console.log('parseStringToJSONdata Error :>> ', error);
		return data;
	}
};

export {parseStringToJSONdata};
