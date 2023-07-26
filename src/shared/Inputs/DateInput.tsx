import React, {FC} from 'react';

import DateTimePickerModal from 'react-native-modal-datetime-picker';

type pickerDate = Date | undefined;

type DateInputProps = {
	isVisible?: boolean;
	setVisibility?: (isVisible: boolean) => void;
	dateValue?: pickerDate;
	setDateValue?: (date: pickerDate) => void;
};

const maxDate: pickerDate = new Date();

const DateInput: FC<DateInputProps> = ({isVisible, setVisibility, dateValue, setDateValue}) => {
	const handleChangeDateOfBirth = (event: Event, date?: pickerDate): void => {
		if (setDateValue) {
			setDateValue(date);
		}
	};

	const hideDatePicker = (): void => {
		if (setVisibility) {
			setVisibility(false);
		}
	};

	const handleConfirm = (date: Date): void => {
		hideDatePicker();
		if (setDateValue) {
			setDateValue(date); //!android fix
		}
	};

	return (
		<DateTimePickerModal
			isVisible={isVisible}
			mode="date"
			date={dateValue}
			themeVariant="light"
			isDarkModeEnabled={false}
			onConfirm={handleConfirm}
			onCancel={hideDatePicker}
			maximumDate={maxDate}
			onChange={handleChangeDateOfBirth}
		/>
	);
};

export {DateInput};
