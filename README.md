Like [TypeChat](https://github.com/microsoft/TypeChat/tree/main) but with Zod and [function calls](https://platform.openai.com/docs/guides/function-calling)

ZodChat allows you to get well-typed and structured data from GPT-4

Example
---
See some examples in the examples folder

How to use
---
```
bun install zodchat
```

Generate an [API key](https://platform.openai.com/api-keys), then put it in your local .env.local file:

```
OPENAI_API_KEY=your_key_here
```

Then use it like:

```ts
import { prompt } from 'zodchat'
```
