'use server'

import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z.string().email('Pleas, provide a valid e-mail address.'),
  password: z.string().min(1, 'Please, provide a password.'),
})

export async function signInWithEmailAndPassword(data: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  try {
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors

      return { success: false, message: null, errors }
    }

    const { token } = await signInWithPassword(result.data)

    const cookiesSession = await cookies()

    cookiesSession.set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    const inviteId = cookiesSession.get('inviteId')?.value

    if (inviteId) {
      try {
        await acceptInvite(inviteId)

        cookiesSession.delete('inviteId')
      } catch {}
    }
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
