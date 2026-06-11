import { spawn, spawnSync } from 'node:child_process';
import { platform } from 'node:process';
import { note } from '#tui/output/notes';
import { notificationCommands } from '#tui/output/notify/commands';
import type { NotificationCommand } from '#tui/output/notify/commands';

export type { NotificationCommand };
export { notificationCommands };

const commandExists = (bin: string): boolean => {
	const result = spawnSync('command', ['-v', bin], { shell: true, stdio: 'ignore' });

	return result.status === 0;
};

const availableNotificationCommand = (targetPlatform: NodeJS.Platform, commands: NotificationCommand[]): NotificationCommand | null => {
	if (targetPlatform !== 'linux') {
		return commands.at(0) ?? null;
	}

	return commands.find((command) => commandExists(command.bin)) ?? null;
};

export const notificationCommand = (targetPlatform: NodeJS.Platform, title: string, body = '', subtitle = '', sound = '', icon = ''): NotificationCommand | null => {
	return notificationCommands(targetPlatform, { body, icon, sound, subtitle, title }).at(0) ?? null;
};

export const notifyForPlatform = (targetPlatform: NodeJS.Platform, title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
	const commands = notificationCommands(targetPlatform, { body, icon, sound, subtitle, title });
	const command = availableNotificationCommand(targetPlatform, commands);

	if (command) {
		spawn(command.bin, command.args, { detached: true, stdio: 'ignore' }).unref();

		return;
	}

	note(body ? `${title}: ${body}` : title, 'info');
};

export const notify = (title: string, body = '', subtitle = '', sound = '', icon = ''): void => {
	notifyForPlatform(platform, title, body, subtitle, sound, icon);
};
