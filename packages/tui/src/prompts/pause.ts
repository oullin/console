import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask, promptWithFallback } from '#tui/prompt';
import { renderPause } from '#tui/prompts/pause/render';

export const pause = async (message = 'Press enter to continue...'): Promise<boolean> => {
	return promptWithFallback('pause', { message }, async () => pauseWithoutFallback(message));
};

const pauseWithoutFallback = async (message: string): Promise<boolean> => {
	const environment = promptEnvironment();

	if (!environment.interactive) {
		return false;
	}

	if (!environment.input.readKey) {
		await ask(message);

		return true;
	}

	environment.output.write(renderPause(message));

	while (true) {
		const key = await environment.input.readKey();

		if (key === null || key === Key.enter) {
			environment.output.write('\n');

			return true;
		}
	}
};
