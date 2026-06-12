import { renderBox } from '#tui/theme/box';
import { cyan } from '#tui/theme/styles';

export const renderPause = (message: string): string => {
	return renderBox({ body: '', borderStyle: cyan, title: cyan(message) });
};
