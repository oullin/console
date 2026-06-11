import type { Validator } from '#tui/contracts/base';

export type BasePromptOptions<T> = {
	message: string;
	default?: T;
	required?: boolean | string;
	hint?: string;
	validate?: Validator<T>;
};
