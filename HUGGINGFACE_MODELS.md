# HuggingFace Models Integration

This document explains how to use the HuggingFace Inference Models integration to fetch and filter models based on specific criteria.

## Features

- **Automatic Model Fetching**: Fetches top inference models from HuggingFace
- **Smart Filtering**: Automatically filters models based on:
  - Structured output support (JSON-compatible)
  - Context window size (minimum configurable)
  - "Cheapest" tier models (cost-effective options)
- **Default Fallback**: Uses curated default models if HuggingFace API is unavailable
- **React Component Integration**: Easy-to-use `ProviderSelector` component with HuggingFace mode

## API Endpoints

### `/api/huggingface-models`

Fetch and filter models from HuggingFace Inference API.

#### Query Parameters:
- `action` (optional): `filtered`, `raw`, or `filter`
  - `filtered`: Get pre-filtered models (default)
  - `raw`: Get all models without filtering
  - `filter`: Get all models and then filter them
- `minContextWindow` (optional): Minimum context window in tokens (default: 4000)
- `limit` (optional): Maximum number of models to return (default: 10)

#### Examples:

```bash
# Get top 10 filtered models with minimum 4000 token context
GET /api/huggingface-models?action=filtered&limit=10

# Get filtered models with higher context window requirement
GET /api/huggingface-models?action=filtered&minContextWindow=8000&limit=5

# Get raw, unfiltered models
GET /api/huggingface-models?action=raw

# Get all models and then filter
GET /api/huggingface-models?action=filter&minContextWindow=6000
```

#### Response:

```json
{
  "success": true,
  "models": [
    {
      "id": "mistralai/Mistral-7B-Instruct-v0.2",
      "name": "Mistral 7B Instruct",
      "description": "Fast 7B model, excellent instruction following",
      "contextWindow": 8000,
      "supportsStructuredOutput": true,
      "isCheapest": true,
      "pricing": {
        "inputCost": 0.14,
        "outputCost": 0.42
      },
      "tags": ["instruct", "fast", "recommended"]
    }
    // ... more models
  ],
  "count": 10,
  "criteria": {
    "supportsStructuredOutput": true,
    "minContextWindow": 4000,
    "hasCheapestFlag": true
  }
}
```

## Library Functions

### `lib/huggingface-models.ts`

#### `fetchHuggingFaceModels(): Promise<HFModel[]>`
Fetches models from HuggingFace API and returns them in a standardized format.

```typescript
import { fetchHuggingFaceModels } from '@/lib/huggingface-models';

const models = await fetchHuggingFaceModels();
```

#### `filterModels(models: HFModel[], minContextWindow?: number): HFModel[]`
Filters models based on structured output support, context window, and cheapest flag.

```typescript
import { filterModels } from '@/lib/huggingface-models';

const filtered = filterModels(models, 4000); // 4000 token minimum
```

#### `getTopFilteredModels(limit?: number, minContextWindow?: number): Promise<HFModel[]>`
Gets pre-filtered and sorted models (cheapest first, then by context window).

```typescript
import { getTopFilteredModels } from '@/lib/huggingface-models';

const top10 = await getTopFilteredModels(10, 4000);
```

## React Component Usage

### ProviderSelector with HuggingFace Models

Use the `ProviderSelector` component with HuggingFace mode enabled:

```tsx
import { ProviderSelector } from '@/components/ProviderSelector';

export function MyComponent() {
  const handleModelSelect = (model) => {
    console.log('Selected model:', model);
  };

  return (
    <ProviderSelector
      useHuggingFaceModels={true}
      minContextWindow={4000}
      onModelSelect={handleModelSelect}
    />
  );
}
```

### Props:

- `useHuggingFaceModels?: boolean` - Enable HuggingFace mode (default: false)
- `minContextWindow?: number` - Minimum context window in tokens (default: 4000)
- `onModelSelect?: (model: Model | HFModel) => void` - Callback when model is selected
- `selectedModel?: string` - Initial selected model ID
- Other props from the original component

## Model Filtering Criteria

### Structured Output Support
Models must support JSON schema and structured output generation. This is essential for parsing AI responses.

### Context Window
Minimum configurable context window (default: 4000 tokens). This ensures models have enough space for:
- Commit history
- Code diffs
- System prompts
- Response generation

### Cheapest Flag
Only models with the `isCheapest` flag OR models in the most affordable pricing tier are included. This helps with:
- Cost management
- Budget constraints
- Performance per dollar

## Default Models

If the HuggingFace API is unavailable, the following curated default models are used:

1. **Mistral 7B Instruct** - Fastest and cheapest
2. **Llama 3 8B Chat** - Latest and affordable
3. **Mixtral 8x7B** - Best for complex reasoning
4. **Llama 2 70B Chat** - Large and capable
5. **Llama 3 70B Chat** - Powerful reasoning
6. **Nous Hermes 2 Mixtral** - Best for JSON

All defaults meet the filtering criteria.

## Error Handling

If the HuggingFace API fails:
1. The system falls back to default curated models
2. Users can still select from pre-configured options
3. An error message is logged but doesn't break the application

## Example: Fetch and Use Filtered Models

```typescript
// Server-side
import { getTopFilteredModels } from '@/lib/huggingface-models';

export async function getAvailableModels() {
  const models = await getTopFilteredModels(10, 4000);
  return models;
}

// Client-side
'use client';

import { useEffect, useState } from 'react';

export function ModelSelector() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetch('/api/huggingface-models?action=filtered&limit=10')
      .then(res => res.json())
      .then(data => setModels(data.models));
  }, []);

  return (
    <select>
      {models.map(model => (
        <option key={model.id} value={model.id}>
          {model.name} {model.isCheapest ? '(Cheapest)' : ''}
        </option>
      ))}
    </select>
  );
}
```
