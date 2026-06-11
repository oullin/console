export type ProgressFrameOptions = {
	current: number;
	hint: string;
	label: string;
	total: number;
	width?: number;
};

export const progressPercentage = (current: number, total: number): number => {
	return current / total;
};

export const renderProgressFrame = ({ current, hint, label, total, width = 20 }: ProgressFrameOptions): string => {
	const filled = Math.ceil(width * progressPercentage(current, total));
	const bar = `${'█'.repeat(filled)}${' '.repeat(width - filled)}`;
	const suffix = hint ? ` ${hint}` : '';

	return `${label}: ${bar} ${current} / ${total}${suffix}\n`;
};
