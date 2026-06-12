import { platform } from 'node:process';
import { note } from '#tui/output/notes';
import { notificationCommands } from '#tui/output/notify/commands';
import { availableNotificationCommand, commandExists, executeNotificationCommand } from '#tui/output/notify/executor';
import type { NotificationCommand, NotificationPlatform } from '#tui/output/notify/commands';
import type { NotificationRuntime } from '#tui/output/notify/executor';

export type { NotificationRuntime };
export type { NotificationCommand };
export type { NotificationPlatform };
export { commandExists, executeNotificationCommand, notificationCommands };

export const notificationCommand = (targetPlatform: NotificationPlatform, title: string, body = '', subtitle = '', sound = '', icon = ''): NotificationCommand | null => {
	return notificationCommands(targetPlatform, { body, icon, sound, subtitle, title }).at(0) ?? null;
};

export const notifyForPlatform = (targetPlatform: NotificationPlatform, title: string, body = '', subtitle = '', sound = '', icon = '', runtime: NotificationRuntime = {}): boolean => {
	const commands = notificationCommands(targetPlatform, { body, icon, sound, subtitle, title });
	const command = availableNotificationCommand(targetPlatform, commands, runtime.commandExists ?? commandExists);

	if (command) {
		return (runtime.execute ?? executeNotificationCommand)(command);
	}

	note(body ? `${title}: ${body}` : title, 'info');

	return false;
};

export const notify = (title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
	notifyForPlatform(platform as NotificationPlatform, title, body, subtitle, sound, icon);
};
