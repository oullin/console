import { AsyncLocalStorage } from 'node:async_hooks';
import { defaultEnvironment } from '#tui/environment/runtime';
import { mergePromptEnvironment } from '#tui/environment/scope/merge';
import { withPromptCancelScope } from '#tui/prompt/cancel';
import { withPromptFallbackScope } from '#tui/prompt/fallback';
import { withPromptGlobalValidationScope } from '#tui/prompt/validate-using';
import type { MaybePromise, PromptEnvironment } from '#tui/types';

let currentEnvironment: PromptEnvironment = defaultEnvironment;

const scopedEnvironment = new AsyncLocalStorage<PromptEnvironment>();

export const promptEnvironment = (): PromptEnvironment => scopedEnvironment.getStore() ?? currentEnvironment;

export const configurePrompts = (environment: Partial<PromptEnvironment>): void => {
	const scoped = scopedEnvironment.getStore();
	const next = mergePromptEnvironment(scoped ?? currentEnvironment, environment);

	if (scoped === undefined) {
		currentEnvironment = next;

		return;
	}

	scopedEnvironment.enterWith(next);
};

export const withPromptEnvironment = async <T>(environment: Partial<PromptEnvironment>, callback: () => MaybePromise<T>): Promise<T> => {
	const next = mergePromptEnvironment(promptEnvironment(), environment);

	return scopedEnvironment.run(next, () => withPromptCancelScope(() => withPromptFallbackScope(() => withPromptGlobalValidationScope(callback))));
};
