# Task

The `task` helper runs work with structured task logging.

```ts
import { task } from '@ollin/console';

const result = await task('Publishing', async (logger) => {
	logger.info('Uploading assets');
	logger.success('Assets uploaded');

	return 'published';
});
```

Use `logger.info`, `logger.line`, `logger.success`, `logger.warning`, and `logger.error` to emit task output while the task runs.

## Complete Usage

```ts
import { form, task } from '@ollin/console';

const result = await task('Publishing', async (logger) => {
	logger.info('Uploading assets');
	logger.line('Writing manifest');
	logger.success('Assets uploaded');

	return 'published';
});

const responses = await form()
	.task('Checking package', async (logger) => {
		logger.info('Reading package.json');
		logger.success('Package looks valid');

		return true;
	}, 10, true, 'metadata', 'packageCheck')
	.submit();

void [result, responses];
```

## Consumer Call And Output

```ts
import { task } from '@ollin/console';

await task('Publishing package', async (logger) => {
	logger.info('Uploading files');
	logger.success('Published');
});
```

<TerminalOutput :lines='["Publishing package","Uploading files","Published"]' />
