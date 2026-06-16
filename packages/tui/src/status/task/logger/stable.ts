import type { StableTaskMessage } from '#tui/status/task/messages';

export const appendStableTaskMessage = (messages: StableTaskMessage[], type: StableTaskMessage['type'], message: string, limit: number): void => {
	messages.push({ message, type });

	while (messages.length > limit) {
		messages.shift();
	}
};
