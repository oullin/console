import { promptWithFallback } from '#tui/prompt';
import { readPauseConfirmation } from '#tui/prompts/pause/read';

export const pause = async (message = 'Press enter to continue...'): Promise<boolean> => {
	return promptWithFallback('pause', { message }, async () => readPauseConfirmation(message));
};
