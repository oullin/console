import { parseFallbackHandler, resolveFallbackCondition } from '#tui/prompt/validators/fallback';
import type { MaybePromise } from '#tui/types';

export type PromptFallbackKind = 'autocomplete' | 'confirm' | 'datatable' | 'multisearch' | 'multiselect' | 'number' | 'password' | 'pause' | 'search' | 'select' | 'suggest' | 'text' | 'textarea';

export type PromptFallbackHandler<TOptions = unknown, TResult = unknown> = (options: TOptions) => MaybePromise<TResult>;

export type PromptFallbackCondition = boolean | (() => boolean);

const fallbackHandlers = new Map<PromptFallbackKind, PromptFallbackHandler>();

let fallbackCondition: PromptFallbackCondition = false;

export const fallbackWhen = (condition: PromptFallbackCondition): void => {
	fallbackCondition = condition;
};

export const fallbackUsing = <TOptions, TResult>(kind: PromptFallbackKind, handler?: PromptFallbackHandler<TOptions, TResult> | null): void => {
	if (!handler) {
		fallbackHandlers.delete(kind);

		return;
	}

	fallbackHandlers.set(kind, parseFallbackHandler<unknown, unknown>(handler));
};

export const shouldFallback = (kind: PromptFallbackKind): boolean => {
	const enabled = resolveFallbackCondition(fallbackCondition);

	return enabled && fallbackHandlers.has(kind);
};

export const promptWithFallback = async <TOptions, TResult>(kind: PromptFallbackKind, options: TOptions, run: () => MaybePromise<TResult>): Promise<TResult> => {
	if (!shouldFallback(kind)) {
		return run();
	}

	const fallback = fallbackHandlers.has(kind)
		? parseFallbackHandler<TOptions, TResult>(fallbackHandlers.get(kind))
		: undefined;

	if (!fallback) {
		return run();
	}

	return fallback(options);
};
