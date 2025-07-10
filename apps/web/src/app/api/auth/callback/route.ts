import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithGithub } from '@/http/sign-in-with-github'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { message: 'Github OAuth code was not found.' },
      { status: 400 },
    )
  }

  const { token } = await signInWithGithub({ code })

  const cookiesSession = await cookies()
  cookiesSession.set('token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  const redirectUrl = request.nextUrl.clone()

  const inviteId = cookiesSession.get('inviteId')?.value

  if (inviteId) {
    try {
      await acceptInvite(inviteId)
      cookiesSession.delete('inviteId')
    } catch {}
  }

  redirectUrl.pathname = '/'
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl)
}
