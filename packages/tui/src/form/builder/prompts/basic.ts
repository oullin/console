import { numberFormStep, passwordFormStep, textFormStep, textareaFormStep } from '#tui/form/builder/prompts/basic/index';
import type { FormBuilder } from '#tui/form/builder/index';
import type { BasicPromptBuilderMethods } from '#tui/form/builder/prompts/types';

export const basicPromptBuilderMethods: BasicPromptBuilderMethods & ThisType<FormBuilder> = {
	number: numberFormStep,
	password: passwordFormStep,
	text: textFormStep,
	textarea: textareaFormStep,
};
