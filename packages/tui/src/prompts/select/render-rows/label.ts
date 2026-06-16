import type { Choice } from '#tui/types';

export const choiceLabel = <T>(choice: Choice<T>): string => {
	const disabled = choice.disabled ? ` (${typeof choice.disabled === 'string' ? choice.disabled : 'disabled'})` : '';
	const hint = choice.hint ? ` ${choice.hint}` : '';

	return `${choice.label}${hint}${disabled}`;
};
