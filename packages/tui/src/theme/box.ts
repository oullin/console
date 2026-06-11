import { truncate, visibleWidth } from '#tui/strings';

const DEFAULT_BOX_WIDTH = 60;

type BoxOptions = {
	body: string;
	info?: string;
	title?: string;
	width?: number;
};

const padVisible = (value: string, width: number): string => `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;

export const renderBox = ({ body, info = '', title = '', width = DEFAULT_BOX_WIDTH }: BoxOptions): string => {
	const bodyLines = body.split('\n');
	const contentWidth = Math.max(width, visibleWidth(title), ...bodyLines.map(visibleWidth));
	const titleWidth = visibleWidth(title);
	const titleLabel = titleWidth > 0 ? ` ${title} ` : '';
	const topBorder = '─'.repeat(contentWidth - titleWidth + (titleWidth > 0 ? 0 : 2));
	const renderedInfo = info ? truncate(info, contentWidth - 1) : '';
	const bottomBorder = '─'.repeat(renderedInfo ? contentWidth - visibleWidth(renderedInfo) : contentWidth + 2);

	return [` ┌${titleLabel}${topBorder}┐`, ...bodyLines.map((line) => ` │ ${padVisible(line, contentWidth)} │`), ` └${bottomBorder}${renderedInfo ? ` ${renderedInfo} ` : ''}┘`].join('\n');
};
