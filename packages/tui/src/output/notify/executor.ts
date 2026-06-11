import { spawnSync } from 'node:child_process';
import type { NotificationCommand } from '#tui/output/notify/commands';

export type NotificationRuntime = {
	commandExists?: (bin: string) => boolean;
	execute?: (command: NotificationCommand) => boolean;
};

export const commandExists = (bin: string): boolean => {
	const result = spawnSync('command', ['-v', bin], { shell: true, stdio: 'ignore' });

	return result.status === 0;
};

export const executeNotificationCommand = (command: NotificationCommand): boolean => {
	const result = spawnSync(command.bin, command.args, { stdio: 'ignore' });

	return result.status === 0;
};

export const availableNotificationCommand = (targetPlatform: NodeJS.Platform, commands: NotificationCommand[], exists: (bin: string) => boolean = commandExists): NotificationCommand | null => {
	if (targetPlatform !== 'linux') {
		return commands.at(0) ?? null;
	}

	return commands.find((command) => exists(command.bin)) ?? null;
};
