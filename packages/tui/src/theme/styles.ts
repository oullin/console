const ansi = (open: number, close: number, value: string): string => {
	if (value.length === 0) {
		return '';
	}

	return `\u001B[${open}m${value}\u001B[${close}m`;
};

export const dim = (value: string): string => ansi(2, 22, value);

export const inverse = (value: string): string => ansi(7, 27, value);
