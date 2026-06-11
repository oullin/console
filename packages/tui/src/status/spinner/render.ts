const STATIC_SPINNER_FRAME = '⠶';

export const renderSpinnerFrame = (message: string): string => {
	return ` ${STATIC_SPINNER_FRAME} ${message}\n`;
};
