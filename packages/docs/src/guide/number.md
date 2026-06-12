# Number

The `number` helper reads numeric input and supports numeric constraints.

```ts
import { number } from '@ollin/tui';

const copies = await number({
	message: 'How many copies?',
	default: 1,
	integer: true,
	min: 1,
	max: 100,
});
```

## Validation

Use `min`, `max`, and `integer` for common numeric rules. Use `validate` when the rule depends on application state.

```ts
import { number } from '@ollin/tui';

const amount = await number({
	message: 'How many seats?',
	validate: (value) => (Number(value) < 1 ? 'Choose at least one seat.' : null),
});
```

## Complete Usage

```ts
import { number } from '@ollin/tui';

const seats = await number({
	message: 'How many seats?',
	placeholder: '5',
	default: 1,
	integer: true,
	min: 1,
	max: 100,
	hint: 'Seat count controls billing.',
	validate: (value) => (Number(value) % 1 === 0 ? null : 'Use a whole number.'),
});

const retries = await number('Retry attempts', '3', 3, true);

void [seats, retries];
```

## Consumer Call And Output

```ts
import { number } from '@ollin/tui';

const seats = await number({
	message: 'Seats',
	default: 3,
	min: 1,
	integer: true,
});
```

<TerminalOutput :lines='["? Seats","  3"]' />
