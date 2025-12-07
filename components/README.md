DailySummary component

Usage examples:

- Card style (default)

```tsx
import { DailySummary } from './DailySummary'

<DailySummary text={day.aiSummary} />
```

- Inline variant (for top-of-page short intros)

```tsx
import { DailySummary } from './DailySummary'

<DailySummary text={day.aiSummary} variant="inline" />
```

Props:
- text: string (required) — the summary text.
- title?: string — override heading shown in 'card' variant.
- variant?: 'card' | 'inline' — choose presentation.
- className?: string — append extra classes.