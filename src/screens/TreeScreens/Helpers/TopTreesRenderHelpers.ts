const swapWidthAndHeightInPlaces = (
	width: number,
	height: number,
	widthCoefficient: number
): number => (width < height ? width * widthCoefficient : height * widthCoefficient);

export {swapWidthAndHeightInPlaces};
