import {useState} from 'react';

const useOverlaySpinner = (isVisible: boolean): boolean => {
	const [isSpinnerVisible, setIsSpinnerVisible] = useState<boolean>(isVisible);

	if (!isVisible) {
		setTimeout(() => {
			setIsSpinnerVisible(false);
		}, 300);
	} else {
		setTimeout(() => {
			setIsSpinnerVisible(true);
		}, 300);
	}

	return isSpinnerVisible;
};

export {useOverlaySpinner};
