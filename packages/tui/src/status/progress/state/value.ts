import { parseProgressStep } from '#tui/status/validators/progress';

export const nextProgressCurrent = (current: number, total: number, step: number): number => {
	return Math.max(0, Math.min(current + parseProgressStep(step), total));
};
