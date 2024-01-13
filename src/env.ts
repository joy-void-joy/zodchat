import zod from 'zod'

export const env_schema = zod.object({
  OPENAI_API_KEY: zod.string().min(1),
})

export const env = env_schema.parse(Bun.env)
