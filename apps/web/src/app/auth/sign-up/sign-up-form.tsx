'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Loader2 } from 'lucide-react'
import githubIcon from '@/assets/github-icon.svg'

import Image from 'next/image'
import Link from 'next/link'
import { signUpAction } from './actions'
import { useFormState } from '@/hooks/use-form-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { signInWithGithub } from '../actions'

export function SignUpForm() {
  const [{ success, message, errors }, handleSubmit, isPending] =
    useFormState(signUpAction)

  return (
    <div className="space-y-4">
      <form action="" className="space-y-4" onSubmit={handleSubmit}>
        {success === false && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed</AlertTitle>
            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input name="name" id="name" />
          {errors?.name && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.name[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input name="email" type="email" id="email" />
          {errors?.email && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.email[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" id="password" />
          {errors?.password && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.password[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password_confirmation">Confirm Password</Label>
          <Input
            name="password_confirmation"
            type="password"
            id="password_confirmation"
          />
          {errors?.password_confirmation && (
            <p className="text-sm font-medium text-red-500 dark:text-red-400">
              {errors.password_confirmation[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Create account'
          )}
        </Button>

        <Button
          type="button"
          variant="link"
          className="w-full"
          size="sm"
          asChild
        >
          <Link href="/auth/sign-in">Already Registered? Sign in</Link>
        </Button>
      </form>

      <Separator />

      <form action={signInWithGithub}>
        <Button type="button" variant="outline" className="w-full">
          <Image
            src={githubIcon}
            className="mr-2 size-4 dark:invert"
            alt="Github icon"
          />
          Sign up with Gitthub
        </Button>
      </form>
    </div>
  )
}