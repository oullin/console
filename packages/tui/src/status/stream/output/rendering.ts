import type { StreamBuffer } from '#tui/status/stream/buffer';
import type { StreamRenderer } from '#tui/status/stream/renderer';

type StreamRenderContext = {
	buffer: StreamBuffer;
	renderer: StreamRenderer;
};

export const renderStreamBuffer = ({ buffer, renderer }: StreamRenderContext): void => {
	renderer.render({
		fading: buffer.fading,
		value: buffer.stableValue(),
	});
};

export const flushStreamBuffer = (context: StreamRenderContext): void => {
	while (context.buffer.flushNext()) {
		renderStreamBuffer(context);
	}
};
