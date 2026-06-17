import { pause } from '#tui/prompts/choices';
import type { FormBuilder } from '#tui/form/builder/index';

export const pauseFormStep = function pauseFormStep(this: FormBuilder, message = 'Press enter to continue...', name?: string): FormBuilder {
	return this.add(() => pause(message), name);
};
