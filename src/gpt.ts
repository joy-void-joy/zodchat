import type zod from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import OpenAI from 'openai'

export const openai = new OpenAI()

/**
 * Prompt GPT-4 for a well-typed object
 *
 * @param output_schema - Zod schema for the return value
 * @param preamble - Array of chat messages to prompt GPT-5 with. See https://platform.openai.com/docs/api-reference/chat/create
 * @param system_prompt - Overview of the task to be performed
 * @param user_prompt - User input (can be a string or an object)
 * @param examples - List of pairs of user inputs and expected outputs
 * @param function_name - Name of the function call to give to GPT-4.
 * @param function_description - Description of the function call
 * @param temperature - Passed directly to GPT-4
 * @param model - Passed directly to GPT-4
 * @returns A completion from GPT-4 that has been parsed by the output_schema
 */
export async function prompt<
  UserInput,
  ZOutput,
  ZDef extends zod.ZodTypeDef,
  ZInput,
>({
  output_schema,
  preamble = [],
  system_prompt = null,
  user_prompt = null,
  examples = [],
  function_name = 'response',
  function_description = '',
  temperature = 0,
  model = 'gpt-4-turbo-preview',
  max_tokens = 4096,
}: {
  output_schema: zod.ZodSchema<ZOutput, ZDef, ZInput>
  preamble?: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
  system_prompt?: string | null
  user_prompt?: UserInput | null
  examples?: [UserInput, ZInput][]
  function_name?: string
  function_description?: string
  temperature?: number
  model?: string
  max_tokens?: number
}) {
  const {
    choices: [
      {
        message: { function_call },
      },
    ],
  } = await openai.chat.completions.create({
    messages: [
      ...preamble,
      ...(system_prompt
        ? [{ role: 'system', content: system_prompt } as const]
        : []),
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
              name: function_name,
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
        name: function_name,
        description: function_description,
        parameters: zodToJsonSchema(output_schema),
      },
    ],
    function_call: { name: function_name },
  })

  if (function_call?.name != function_name) {
    // Should never happen
    throw new Error(
      `Expected function call ${function_call} to be ${function_name}`
    )
  }

  return await output_schema.parseAsync(JSON.parse(function_call.arguments))
}
