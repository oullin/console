import { parseLogLimit } from '#tui/status/validators/limit';

export type TaskLoggerLimits = {
	line: number;
	stable: number;
};

export const createTaskLoggerLimits = (limit: number): TaskLoggerLimits => {
	const parsed = parseLogLimit(limit, 10);

	return {
		line: parsed,
		stable: parsed,
	};
};
