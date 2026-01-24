# Quick Reference: HuggingFace Models Integration

## 🚀 Quick Start (5 minutes)

### 1. Use in Your Component
```tsx
import { ProviderSelector } from '@/components/ProviderSelector';

export function MyComponent() {
  return (
    <ProviderSelector
      useHuggingFaceModels={true}
      onModelSelect={(model) => {
        console.log('Selected:', model.name, model.id);
      }}
    />
  );
}
```

### 2. Fetch Models via API
```typescript
const response = await fetch('/api/huggingface-models?action=filtered&limit=10');
const { models } = await response.json();
console.log(models); // Already filtered!
```

### 3. Use Library Functions
```typescript
import { getTopFilteredModels } from '@/lib/huggingface-models';

const filtered = await getTopFilteredModels(10, 4000);
```

## 📊 What Gets Filtered

Models must meet ALL three criteria to be shown:

| Criteria | Requirement | Why |
|----------|-------------|-----|
| **Structured Output** | Must support JSON/schema | Parse AI responses |
| **Context Window** | Min 4000 tokens (configurable) | Handle large diffs |
| **Cost-Effective** | Has "cheapest" flag or affordable tier | Manage API costs |

## 🔌 API Endpoints

### Default (Filtered)
```
GET /api/huggingface-models
GET /api/huggingface-models?action=filtered
```

### With Parameters
```
GET /api/huggingface-models?action=filtered&limit=20&minContextWindow=8000
GET /api/huggingface-models?action=raw          # All models, no filtering
GET /api/huggingface-models?action=filter       # All models + then filter
```

## 🎛️ Component Props

```tsx
<ProviderSelector
  useHuggingFaceModels={true}              // Enable HF mode
  minContextWindow={4000}                  // Minimum tokens (default: 4000)
  onModelSelect={(model) => {}}            // Callback on selection
  onProviderSelect={(provider) => {}}      // Provider selection (HF mode: unused)
  selectedModel="mistralai/Mistral-7B"     // Default selected
/>
```

## 📁 File Structure

```
lib/
  └─ huggingface-models.ts        # Core filtering logic
app/
  ├─ api/huggingface-models/
  │   └─ route.ts                 # API endpoint
  └─ huggingface-models-example/
      └─ page.tsx                 # Interactive demo
components/
  └─ ProviderSelector.tsx          # Enhanced component
HUGGINGFACE_MODELS.md             # Full documentation
IMPLEMENTATION_SUMMARY.md         # What was built
QUICK_REFERENCE.md                # This file
```

## 🔍 Default Fallback Models

If HuggingFace API fails, these are used:

1. **Mistral 7B Instruct** - Cheapest, fastest
2. **Llama 3 8B Chat** - Latest, affordable
3. **Mixtral 8x7B** - 32K context, expert MoE
4. **Llama 2 70B Chat** - Large, capable
5. **Llama 3 70B Chat** - Most powerful reasoning
6. **Nous Hermes 2** - Best for JSON

All support structured output and have sufficient context.

## 🎯 Example: Select Best Model for Your Task

```typescript
// Get the cheapest model with 8K+ context
const models = await getTopFilteredModels(5, 8000);
const bestCheap = models[0]; // Cheapest first

// Or from API
fetch('/api/huggingface-models?action=filtered&minContextWindow=8000&limit=1')
  .then(r => r.json())
  .then(data => {
    const bestModel = data.models[0];
    console.log(`Use ${bestModel.name} - costs $${bestModel.pricing.inputCost}/1M tokens`);
  });
```

## 📍 View Interactive Demo

Visit: http://localhost:3000/huggingface-models-example

Shows:
- Live model selector
- Real-time filtering
- Model details (pricing, context, capabilities)
- API usage examples

## 🔗 Type Definitions

```typescript
interface HFModel {
  id: string;                           // Model ID (e.g., "mistralai/Mistral-7B")
  name: string;                         // Display name
  description?: string;                 // What it does
  contextWindow?: number;               // Max tokens
  supportsStructuredOutput?: boolean;   // JSON support
  isCheapest?: boolean;                 // In cheapest tier
  pricing?: {
    inputCost?: number;                 // $ per 1M tokens
    outputCost?: number;
  };
  tags?: string[];                      // Labels (e.g., ["fast", "json"])
}
```

## ⚡ Performance Tips

1. **Cache the list:**
   ```typescript
   // Don't fetch every render
   const [models, setModels] = useState([]);
   useEffect(() => {
     fetch('/api/huggingface-models?action=filtered').then(...)
   }, []); // Only once!
   ```

2. **Increase limit for better choices:**
   ```typescript
   // 10 models (default) vs 20 models
   const response = await fetch(
     '/api/huggingface-models?action=filtered&limit=20'
   );
   ```

3. **Customize context window:**
   ```typescript
   // For small diffs
   const smallContext = await getTopFilteredModels(5, 4000);
   
   // For large diffs
   const largeContext = await getTopFilteredModels(5, 16000);
   ```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No models shown | Check network, verify HuggingFace API is up |
| Wrong context window | Adjust `minContextWindow` parameter |
| Too many models | Decrease `limit` or increase `minContextWindow` |
| Component not updating | Ensure `useHuggingFaceModels={true}` is set |
| Models missing features | They're filtered out - check criteria match |

## 📚 Learn More

- Full docs: [HUGGINGFACE_MODELS.md](./HUGGINGFACE_MODELS.md)
- Implementation details: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- Try it live: `/huggingface-models-example`

## 🔄 Integration Checklist

- [ ] Understand the three filtering criteria
- [ ] Review the Quick Start examples above
- [ ] Visit `/huggingface-models-example` to see it in action
- [ ] Add ProviderSelector to your component with `useHuggingFaceModels={true}`
- [ ] Test with `/api/huggingface-models?action=filtered`
- [ ] Handle model selection in your callback
- [ ] Deploy and monitor!
