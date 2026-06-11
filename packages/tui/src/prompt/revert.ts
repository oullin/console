import { promptEnvironment } from '#tui/environment';
import { renderError } from '#tui/theme';

export const rejectPromptRevert = (): void => {
	promptEnvironment().error.write(renderError('This cannot be reverted.'));
};
