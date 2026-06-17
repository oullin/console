import { parseDisabledReason } from '#tui/theme/validators/disabled';

export const choiceDisabledSuffix = (disabled: boolean | string | undefined): string => {
	if (!disabled) {
		return '';
	}

	return ` (${parseDisabledReason(disabled) ?? 'disabled'})`;
};
