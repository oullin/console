import { parsePromptEnvironmentPatch } from '#tui/environment/scope/validators/patch';
import type { PromptEnvironment } from '#tui/types';

export const mergePromptEnvironment = (current: PromptEnvironment, patch: Partial<PromptEnvironment>): PromptEnvironment => {
	const environment = parsePromptEnvironmentPatch(patch);

	return {
		...current,
		...environment,
		input: environment.input === undefined ? current.input : environment.input,
	};
};
