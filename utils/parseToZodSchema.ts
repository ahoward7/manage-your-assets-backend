import { z } from 'zod'

function mapTypeToZod(value: any): z.ZodTypeAny {
  if (typeof value === 'string')
    return z.string()
  if (typeof value === 'number')
    return z.number()
  if (typeof value === 'boolean')
    return z.boolean()
  if (Array.isArray(value))
    return z.array(mapTypeToZod(value[0]))
  return z.any()
}

export function parseToZodSchema(obj: Record<string, any>): z.ZodTypeAny {
  if (typeof obj !== 'object' || obj === null) {
    return z.any()
  }

  const schema: Record<string, z.ZodTypeAny> = {}

  for (const key in obj) {
    if (Object.keys(obj).includes(key)) {
      const value = obj[key]

      if (typeof value === 'object' && value !== null) {
        schema[key] = parseToZodSchema(value)
      }
      else {
        schema[key] = mapTypeToZod(value)
      }
    }
  }

  return z.object(schema)
}
