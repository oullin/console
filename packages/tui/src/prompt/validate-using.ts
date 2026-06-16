import { parseGlobalValidationOptions } from '#tui/prompt/validators/global-validation';
import type { BasePromptOptions, MaybePromise, ValidationResult } from '#tui/types';

export type PromptGlobalValidator<T> = (value: T, options: BasePromptOptions<T>) => MaybePromise<ValidationResult>;

let globalValidator: PromptGlobalValidator<unknown> | undefined;

export const validateUsing = (validator?: PromptGlobalValidator<unknown> | null): void => {
	globalValidator = validator ?? undefined;
};

export const globalValidationMessage = async <T>(value: T, options: BasePromptOptions<T>): Promise<ValidationResult> => {
	if (!globalValidator) {
		return undefined;
	}

	return globalValidator(value, parseGlobalValidationOptions(options));
};
