import { defaultEnvironment } from '#tui/environment/runtime';
import { mergePromptEnvironment } from '#tui/environment/scope/merge';
import type { PromptEnvironment } from '#tui/types';

let currentEnvironment: PromptEnvironment = defaultEnvironment;

export const promptEnvironment = (): PromptEnvironment => currentEnvironment;

export const configurePrompts = (environment: Partial<PromptEnvironment>): void => {
	currentEnvironment = mergePromptEnvironment(currentEnvironment, environment);
};

export const withPromptEnvironment = async <T>(environment: Partial<PromptEnvironment>, callback: () => Promise<T>): Promise<T> => {
	const previous = currentEnvironment;

	configurePrompts(environment);

	try {
		return await callback();
	} finally {
		currentEnvironment = previous;
	}
};
