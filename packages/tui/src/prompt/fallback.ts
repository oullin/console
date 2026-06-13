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

	fallbackHandlers.set(kind, handler as PromptFallbackHandler);
};

export const shouldFallback = (kind: PromptFallbackKind): boolean => {
	const enabled = typeof fallbackCondition === 'function' ? fallbackCondition() : fallbackCondition;

	return enabled && fallbackHandlers.has(kind);
};

export const promptWithFallback = async <TOptions, TResult>(kind: PromptFallbackKind, options: TOptions, run: () => MaybePromise<TResult>): Promise<TResult> => {
	if (!shouldFallback(kind)) {
		return run();
	}

	const fallback = fallbackHandlers.get(kind) as PromptFallbackHandler<TOptions, TResult> | undefined;

	if (!fallback) {
		return run();
	}

	return fallback(options);
};
