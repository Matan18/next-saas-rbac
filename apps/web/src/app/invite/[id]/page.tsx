import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CheckCircle, LogIn, LogOut } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth, isAuthenticated } from '@/auth/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { acceptInvite } from '@/http/accept-invite'
import { getInvite } from '@/http/get-invite'

dayjs.extend(relativeTime)

interface InvitePageProps {
  params: Promise<{ id: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const inviteId = (await params).id

  const { invite } = await getInvite(inviteId)
  const isUserAuthenticated = await isAuthenticated()

  let currentUserEmail = null
  if (isUserAuthenticated) {
    const user = await auth()

    currentUserEmail = user.user.email
  }
  const userIsAuthenticatedwithSameEmailFromInvite =
    isUserAuthenticated && invite.email === currentUserEmail

  async function signInFromInvite() {
    'use server'
    ;(await cookies()).set('inviteId', inviteId)

    redirect(`/auth/sign-in?email=${invite.email}`)
  }

  async function acceptInviteAction() {
    'use server'
    await acceptInvite(inviteId)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="size-16">
            {invite.author?.avatarUrl && (
              <AvatarImage src={invite.author.avatarUrl} />
            )}

            <AvatarFallback />
          </Avatar>

          <p className="text-balance text-center leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">
              {invite.author?.name ?? 'Someone'}
            </span>
            &nbsp;invited you to join&nbsp;
            <span className="font-medium text-foreground">
              {invite.organization?.name}
            </span>
            .&nbsp;
            <span className="text-xs">{dayjs(invite.createdAt).fromNow()}</span>
          </p>
        </div>

        <Separator />

        {!isUserAuthenticated && (
          <form action={signInFromInvite}>
            <Button type="submit" variant="secondary" className="w-full">
              <LogIn className="mr-2 size-4" />
              Sign in to accept the invite
            </Button>
          </form>
        )}

        {userIsAuthenticatedwithSameEmailFromInvite && (
          <form action={acceptInviteAction}>
            <Button type="submit" variant="secondary" className="w-full">
              <CheckCircle className="mr-2 size-4" />
              Join {invite.organization?.name}
            </Button>
          </form>
        )}

        {isUserAuthenticated && !userIsAuthenticatedwithSameEmailFromInvite && (
          <div className="space-y-4">
            <p className="texct-center text-balance leading-relaxed text-muted-foreground">
              This invite was sent to{' '}
              <span className="font-medium text-foreground">
                {invite.email}
              </span>
              , but you are currently authenticated as
              <span className="font-medium text-foreground">
                {currentUserEmail}
              </span>
              .
            </p>

            <div className="space-y-4">
              <Button className="w-full" variant="secondary" asChild>
                <a href="/api/auth/sign-out">
                  <LogOut className="mr-2 size-4" />
                  Sign out from {currentUserEmail}
                </a>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/">Back to dashboard</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
