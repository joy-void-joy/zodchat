import type zod from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import OpenAI from 'openai'

export const openai = new OpenAI()

export async function prompt<
  UserInput,
  ZOutput,
  ZDef extends zod.ZodTypeDef,
  ZInput,
>({
  output_schema,
  user_prompt = null,
  function_name = null,
  preamble = [],
  system_prompt = '',
  examples = [],
  function_description = '',
  temperature = 0,
  model = 'gpt-4-1106-preview',
  max_tokens = 4096,
}: {
  output_schema: Record<string, zod.ZodSchema<ZOutput, ZDef, ZInput>>
  examples?: [UserInput, ZInput][]
  user_prompt?: UserInput | null
  function_name?: string | null
  preamble?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  system_prompt?: string
  function_description?: string
  temperature?: number
  model?: string
  max_tokens?: number
}) {
  const [record_name, function_input_schema] = Object.entries(output_schema)[0]
  const full_function_name = function_name || `suggest_${record_name}`

  const {
    choices: [
      {
        message: { function_call },
      },
    ],
  } = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: system_prompt },
      ...preamble,
      ...examples.flatMap(
        ([user_example, function_call_example]) =>
          [
            {
              role: 'system',
              name: 'user_example',
              content: JSON.stringify(user_example, null, 2),
            },
            {
              role: 'function',
              name: full_function_name,
              content: JSON.stringify(function_call_example, null, 2),
            },
          ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[]
      ),
      {
        role: 'user',
        content:
          user_prompt != null ? JSON.stringify(user_prompt, null, 2) : '',
      },
    ],
    model,
    temperature,
    max_tokens,
    functions: [
      {
        name: full_function_name,
        description: function_description,
        parameters: zodToJsonSchema(function_input_schema),
      },
    ],
    function_call: { name: full_function_name },
  })

  if (function_call?.name != full_function_name) {
    // Should never happen
    throw new Error(
      `Expected function call ${function_call} to be ${full_function_name}`
    )
  }

  return await function_input_schema.parseAsync(
    JSON.parse(function_call.arguments)
  )
}
