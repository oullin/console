import { parseCancelValue } from '#tui/prompt/validators/cancel';
import type { MaybePromise } from '#tui/types';

export type PromptCancelHandler = () => MaybePromise<unknown>;

let promptCancelHandler: PromptCancelHandler | null = null;

export const cancelUsing = (handler?: PromptCancelHandler | null): void => {
	promptCancelHandler = handler ?? null;
};

export const cancelPrompt = async <T>(fallback: T): Promise<T> => {
	if (promptCancelHandler === null) {
		return fallback;
	}

	return parseCancelValue<T>(await promptCancelHandler());
};
