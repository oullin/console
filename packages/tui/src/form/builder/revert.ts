import { configurePrompts, promptEnvironment } from '#tui/environment';
import { Key } from '#tui/key';
import { renderError } from '#tui/theme';
import type { MaybePromise, PromptInput } from '#tui/types';

export class FormRevertedError extends Error {
	constructor() {
		super('Form reverted.');
		this.name = 'FormRevertedError';
	}
}

export const runWithFormRevert = async <T>(canRevert: boolean, callback: () => MaybePromise<T>): Promise<T> => {
	const environment = promptEnvironment();

	if (!environment.input.readKey) {
		return callback();
	}

	const previousInput = environment.input;

	const input: PromptInput = {
		...previousInput,
		async readKey(): Promise<string | null> {
			while (true) {
				const key = await previousInput.readKey?.();

				if (key !== Key.ctrlU) {
					return key ?? null;
				}

				if (canRevert) {
					throw new FormRevertedError();
				}

				environment.error.write(renderError('This cannot be reverted.'));
			}
		},
	};

	configurePrompts({ input });

	try {
		return await callback();
	} finally {
		configurePrompts({ input: previousInput });
	}
};
