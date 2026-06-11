import { promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { ask } from '#tui/prompt';
import { renderQuestion } from '#tui/theme';

export const pause = async (message = 'Press enter to continue...'): Promise<boolean> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		await ask(message);

		return environment.interactive;
	}

	environment.output.write(renderQuestion(message));

	while (true) {
		const key = await environment.input.readKey();

		if (key === null || key === Key.enter) {
			environment.output.write('\n');

			return environment.interactive;
		}
	}
};
