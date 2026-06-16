import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask } from '#tui/prompt';
import { renderPause } from '#tui/prompts/pause/render';

export const readPauseConfirmation = async (message: string): Promise<boolean> => {
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
