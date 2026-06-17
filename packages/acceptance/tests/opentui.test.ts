import { Text } from '@opentui/core';
import { createTestRenderer } from '@opentui/core/testing';
import { describe, expect, it } from 'vitest';
import { renderOpenTuiTextFrame } from '@ollin/tui';

describe('OpenTUI memory renderer', () => {
	it('captures rendered text without writing to the real terminal', async () => {
		let testRenderer: Awaited<ReturnType<typeof createTestRenderer>>;

		try {
			testRenderer = await createTestRenderer({ width: 20, height: 4 });
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toContain('native FFI is not available');

			return;
		}

		const { renderer, renderOnce, captureCharFrame } = testRenderer;

		try {
			renderer.root.add(Text({ content: 'Prompt' }));

			await renderOnce();

			expect(captureCharFrame()).toContain('Prompt');
		} finally {
			renderer.destroy();
		}
	});

	it('renders through the package OpenTUI adapter', async () => {
		try {
			const frame = await renderOpenTuiTextFrame('Prompt', { width: 20, height: 4 });

			expect(frame.text).toContain('Prompt');
		} catch (error) {
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toContain('native FFI is not available');
		}
	});
});
