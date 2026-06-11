import { ask } from '#tui/prompt';

export const pause = async (message = 'Press enter to continue'): Promise<void> => {
	await ask(message);
};
