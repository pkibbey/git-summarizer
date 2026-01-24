# Integration Guide: Using HuggingFace Models in Your App

## Overview
This guide shows you how to integrate the new HuggingFace Models feature into your existing application.

## Step 1: Replace Your Model Selector

### Before (Old Way)
```tsx
<ProviderSelector />
```

### After (New Way with HuggingFace)
```tsx
<ProviderSelector 
  useHuggingFaceModels={true}
  minContextWindow={4000}
  onModelSelect={handleModelSelect}
/>
```

## Step 2: Handle Model Selection

The callback now receives an `HFModel` object instead of the old model format:

```tsx
const handleModelSelect = (model) => {
  // For HuggingFace models, model has:
  // - id: string (e.g., "mistralai/Mistral-7B")
  // - name: string
  // - contextWindow: number
  // - supportsStructuredOutput: boolean
  // - isCheapest: boolean
  // - pricing: { inputCost, outputCost }
  
  console.log(`Selected: ${model.name}`);
  console.log(`Context: ${model.contextWindow} tokens`);
  console.log(`Cost: $${model.pricing.inputCost} per 1M input tokens`);
  
  // Save or use the selected model
  saveSelectedModel(model.id);
};
```

## Step 3: Use in Your Forms

Example: Add to a git analysis form

```tsx
'use client';

import { ProviderSelector } from '@/components/ProviderSelector';
import type { HFModel } from '@/lib/huggingface-models';

export function AnalysisForm() {
  const [selectedModel, setSelectedModel] = useState<HFModel | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedModel) {
      alert('Please select a model');
      return;
    }

    // Send analysis request with selected model
    const response = await fetch('/api/analyze-commit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId: selectedModel.id,
        // ... other form data
      }),
    });

    const result = await response.json();
    console.log('Analysis result:', result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Select Analysis Model</h2>
        <ProviderSelector
          useHuggingFaceModels={true}
          minContextWindow={4000}
          onModelSelect={setSelectedModel}
        />
      </div>

      {selectedModel && (
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-sm text-gray-600">
            Using <span className="font-semibold">{selectedModel.name}</span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedModel}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        Start Analysis
      </button>
    </form>
  );
}
```

## Step 4: Use Models in API Routes

In your API route handlers, use the model ID to make inference requests:

```typescript
// app/api/analyze-commit/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { modelId, commit, diff } = await request.json();

  try {
    // Use the model ID with your inference provider
    const response = await fetch('https://api.together.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId, // Use the selected model ID
        messages: [
          {
            role: 'system',
            content: 'You are a code analyzer...',
          },
          {
            role: 'user',
            content: `Analyze this commit:\n${diff}`,
          },
        ],
        response_format: { type: 'json_object' }, // Structured output
      }),
    });

    const data = await response.json();
    return NextResponse.json({ success: true, analysis: data });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
```

## Step 5: Store Selected Model Preference

Save the user's model choice for future sessions:

```typescript
// lib/user-preferences.ts

export function saveModelPreference(userId: string, modelId: string) {
  // Store in database or localStorage
  localStorage.setItem(`user_${userId}_model`, modelId);
}

export function getModelPreference(userId: string) {
  return localStorage.getItem(`user_${userId}_model`);
}
```

Then use it in your component:

```tsx
<ProviderSelector
  useHuggingFaceModels={true}
  selectedModel={getModelPreference(userId)}
  onModelSelect={(model) => {
    setSelectedModel(model);
    saveModelPreference(userId, model.id);
  }}
/>
```

## Step 6: Add Context-Aware Model Selection

Choose models based on your task requirements:

```tsx
// For small commits (< 5KB)
<ProviderSelector useHuggingFaceModels={true} minContextWindow={4000} />

// For large commits (> 50KB)
<ProviderSelector useHuggingFaceModels={true} minContextWindow={16000} />

// For real-time analysis (need speed)
// Programmatically select the first (cheapest) model
const fastModels = await fetch('/api/huggingface-models?action=filtered&limit=1');
```

## Step 7: Display Model Info in Results

Show which model was used when displaying analysis results:

```tsx
function AnalysisResult({ analysis, modelName }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 border-b pb-2">
        Analysis by <span className="font-semibold">{modelName}</span>
      </div>
      <div className="prose">
        {analysis.summary}
      </div>
    </div>
  );
}
```

## Step 8: Add Model Statistics

Track which models are being used:

```typescript
// app/api/model-stats/route.ts

export async function POST(request: NextRequest) {
  const { modelId } = await request.json();

  // Log model usage
  await logModelUsage(modelId);

  return NextResponse.json({ success: true });
}

// Then in your component
await fetch('/api/model-stats', {
  method: 'POST',
  body: JSON.stringify({ modelId: selectedModel.id }),
});
```

## Common Integration Patterns

### Pattern 1: Simple Model Selection
```tsx
<ProviderSelector useHuggingFaceModels={true} onModelSelect={setModel} />
```

### Pattern 2: Advanced Filtering
```tsx
// Let users choose context window requirement
const [contextWindow, setContextWindow] = useState(4000);

<input
  type="number"
  value={contextWindow}
  onChange={(e) => setContextWindow(e.target.value)}
  min="4000"
  max="32000"
  step="1000"
/>

<ProviderSelector
  useHuggingFaceModels={true}
  minContextWindow={contextWindow}
  onModelSelect={setModel}
/>
```

### Pattern 3: Model Comparison
```tsx
// Show multiple models side-by-side
const models = await fetch('/api/huggingface-models?action=filtered&limit=5');
const data = await models.json();

<div className="grid grid-cols-2 gap-4">
  {data.models.map(m => (
    <ModelCard key={m.id} model={m} onSelect={setModel} />
  ))}
</div>
```

### Pattern 4: Cost Calculator
```tsx
// Calculate estimated costs
function estimateCost(model, inputTokens, outputTokens) {
  const inputCost = (inputTokens / 1_000_000) * model.pricing.inputCost;
  const outputCost = (outputTokens / 1_000_000) * model.pricing.outputCost;
  return inputCost + outputCost;
}

const estimatedCost = estimateCost(selectedModel, 50000, 5000);
<p>Estimated cost: ${estimatedCost.toFixed(4)}</p>
```

## Testing Your Integration

### Test Endpoint
```bash
curl "http://localhost:3000/api/huggingface-models?action=filtered&limit=5" | jq
```

### Test Component
```tsx
// pages/test-models.tsx
import { ProviderSelector } from '@/components/ProviderSelector';

export default function TestModels() {
  return (
    <div className="p-8">
      <ProviderSelector 
        useHuggingFaceModels={true} 
        onModelSelect={(m) => console.log('Selected:', m)}
      />
    </div>
  );
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Models not loading | Check network, verify API endpoint is running |
| Wrong models showing | Verify `minContextWindow` setting |
| Component not re-rendering | Ensure `useHuggingFaceModels={true}` is set |
| API errors | Check server logs, verify HuggingFace endpoint |

## Next Steps

1. ✅ Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick examples
2. ✅ Check [HUGGINGFACE_MODELS.md](./HUGGINGFACE_MODELS.md) for detailed API docs
3. ✅ Visit `/huggingface-models-example` to see interactive demo
4. ✅ Implement integration pattern that fits your app
5. ✅ Test thoroughly before deploying
6. ✅ Monitor model usage and costs

## Support

Need help? Check:
- Component code: [ProviderSelector.tsx](./components/ProviderSelector.tsx)
- API route: [app/api/huggingface-models/route.ts](./app/api/huggingface-models/route.ts)
- Library: [lib/huggingface-models.ts](./lib/huggingface-models.ts)
- Demo: `/huggingface-models-example`
