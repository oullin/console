import { notify } from '#tui/output';
import type { FormBuilder } from '#tui/form/builder/index';

export const notifyFormStep = function notifyFormStep(this: FormBuilder, title: string, body = '', subtitle = '', sound = '', icon = '', name?: string): FormBuilder {
	return this.addSideEffect(() => notify(title, body, subtitle, sound, icon), name);
};
