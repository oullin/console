import { red } from '#tui/theme/styles';
import { symbols } from '#tui/theme/symbols';

export const renderError = (message: string): string => `${red(`${symbols.error} ${message}`)}\n`;
