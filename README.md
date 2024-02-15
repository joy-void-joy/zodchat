Zodchat is a GPT-4 interface that allows you to get well-typed and structured data
It is like [TypeChat](https://github.com/microsoft/TypeChat/tree/main) but with Zod and [function calls](https://platform.openai.com/docs/guides/function-calling)

Example
---
see more in examples/
```ts
const Song = zod
  .object({
    name: zod.string().describe('Name of the song to play'),
    artist: zod.string().describe('Name of the artist of the song'),
    genre: zod
      .string()
      .array()
      .describe('Genre of the song using whimsical words'),
    vibe: zod
      .string()
      .describe('General vibe of the song using whimsical words'),
  })
  .describe('A song to play')

  await prompt({
    output_schema: Playlist,
    system_prompt: 'Please give a chill instrumental song',
  })
```

How to use
---
With bun:
```
bun add zodchat
```
Or yarn:
```
yarn add zodchat
```

Generate an [API key](https://platform.openai.com/api-keys), then put it in your local .env.local file:

```
OPENAI_API_KEY=your_key_here
```

or use ```sh
export OPENAI_API_KEY=your_key_here
```

Then you can directly import and use the library:

```ts
import { prompt } from 'zodchat'
```

Tip for prompting
---
- Telling GPT-4 to use whimsical words usually leads it to produce more diverse object-level outputs. In examples/song for instance, asking for "whimsical words" genres makes it output different genres than just the one asked for.
- GPT will use the output schema to prompt itself, therefore it is often useful to ask it for more information than is needed. For instance, in examples/songs, asking for just {name, artist} would make it match on title (Eruption of Ignorance would lead it to suggest many fire-related titles). Including genre and vibes in the requested output lead it to actually match on them.
- Be careful about token consumption, as the whole schema is passed, it can be very resource expensive
