import { StreamBuffer } from '#tui/status/stream/buffer';
import { StreamLifecycle } from '#tui/status/stream/lifecycle';
import { StreamRenderer } from '#tui/status/stream/renderer';

export type StreamOutputContext = {
	buffer: StreamBuffer;
	lifecycle: StreamLifecycle;
	renderer: StreamRenderer;
};

export const createStreamOutputContext = (flush: () => void): StreamOutputContext => ({
	buffer: new StreamBuffer(10),
	lifecycle: new StreamLifecycle(flush),
	renderer: new StreamRenderer(),
});
