'use server'

import { signInWithPassword } from '@/http/sign-in-with-password'
import { HTTPError } from 'ky'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Pleas, provide a valid e-mail address.'),
  password: z.string().min(1, 'Please, provide a password.'),
})

export async function signInWithEmailAndPassword(
  previousState: unknown,
  data: FormData
) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  try {
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors

      return { success: false, message: null, errors }
    }

    const { token } = await signInWithPassword(result.data)
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in few minutes.',
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
