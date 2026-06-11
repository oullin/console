import { describe, expect, it } from 'vitest';
import { createMemoryOutput, notificationCommand, notificationCommands, notifyForPlatform, withPromptEnvironment } from '#tui/index';

describe('notify helper', () => {
	it('builds macOS notification commands', () => {
		const command = notificationCommand('darwin', 'Deploy', 'Done', 'Preview', 'Glass');

		expect(command?.bin).toBe('osascript');
		expect(command?.args[0]).toBe('-e');
		expect(command?.args[1]).toContain('display notification "Done"');
		expect(command?.args[1]).toContain('with title "Deploy"');
		expect(command?.args[1]).toContain('subtitle "Preview"');
		expect(command?.args[1]).toContain('sound name "Glass"');
	});

	it('builds Linux notification commands', () => {
		expect(notificationCommand('linux', 'Deploy', 'Done')).toEqual({
			args: ['Deploy', 'Done'],
			bin: 'notify-send',
		});

		expect(notificationCommand('linux', 'Deploy')).toEqual({
			args: ['Deploy'],
			bin: 'notify-send',
		});

		expect(notificationCommand('linux', 'Deploy', 'Done', '', '', '/tmp/icon.png')).toEqual({
			args: ['--icon', '/tmp/icon.png', 'Deploy', 'Done'],
			bin: 'notify-send',
		});
	});

	it('builds Linux fallback notification commands in availability order', () => {
		expect(notificationCommands('linux', { title: 'Deploy', body: 'Done' })).toEqual([
			{
				args: ['Deploy', 'Done'],
				bin: 'notify-send',
			},
			{
				args: ['--passivepopup', 'Deploy: Done', '5', '--title', 'Deploy'],
				bin: 'kdialog',
			},
		]);
	});

	it('falls back to note output on unsupported platforms', async () => {
		const output = createMemoryOutput();

		await withPromptEnvironment({ output, error: output }, async () => {
			notifyForPlatform('freebsd', 'Deploy', 'Done');
		});

		expect(output.text()).toContain('Deploy: Done');
	});
});
