'use server'

import { signUp } from '@/http/sign-up'
import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z
  .object({
    name: z.string().refine((value) => value.split(' ').length > 1, {
      message: 'Please, enter your full name.',
    }),
    email: z.string().email('Pleas, provide a valid e-mail address.'),
    password: z.string().min(6, 'Password should have at least 6 characters.'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Password confirmation do not match.',
    path: ['password_confirmation'],
  })

export async function signUpAction(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data))

  try {
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors

      return { success: false, message: null, errors }
    }
    const { name, email, password } = result.data

    await signUp({ name, email, password })
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

  redirect('/')
}
