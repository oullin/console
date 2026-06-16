import { spawnSync } from 'node:child_process';
import type { NotificationCommand, NotificationPlatform } from '#tui/output/notify/commands';

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

export const availableNotificationCommands = (targetPlatform: NotificationPlatform, commands: NotificationCommand[], exists: (bin: string) => boolean = commandExists): NotificationCommand[] => {
	if (targetPlatform !== 'linux') {
		return commands.slice(0, 1);
	}

	return commands.filter((command) => exists(command.bin));
};
