import { parseProgressTotal } from '#tui/status/validators/progress';

export const progressValues = <T>(steps: Iterable<T> | number): Array<T | number> => {
	return typeof steps === 'number' ? Array.from({ length: parseProgressTotal(steps) }, (_, index) => index) : Array.from(steps);
};
