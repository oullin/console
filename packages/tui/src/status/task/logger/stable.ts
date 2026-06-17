import { parseLogLimit } from '#tui/status/validators/limit';
import type { StableTaskMessage } from '#tui/status/task/messages';

export const appendStableTaskMessage = (messages: StableTaskMessage[], type: StableTaskMessage['type'], message: string, limit: number): void => {
	const stableLimit = parseLogLimit(limit, 10);

	messages.push({ message, type });

	while (messages.length > stableLimit) {
		messages.shift();
	}
};
