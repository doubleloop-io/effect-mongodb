---
"effect-mongodb": patch
---

Swap `Collection.aggregate` pipeline and schema parameter positions

```typescript
// Before
Collection.aggregate(pipeline, schema)

// After
Collection.aggregate(schema, pipeline)
```
