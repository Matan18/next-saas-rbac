'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Check, UserPlus2, X } from 'lucide-react'
import { useState } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getPendingInvites } from '@/http/get-pending-invites'

import { Button } from '../ui/button'
import { accpetInviteAction, rejectInviteAction } from './actions'

dayjs.extend(relativeTime)

export function PendingInvites() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ['pending-invites'],
    queryFn: getPendingInvites,
    enabled: isOpen,
  })

  async function handleAcceptInvite(inviteId: string) {
    await accpetInviteAction(inviteId)

    queryClient.invalidateQueries({
      queryKey: ['pending-invites'],
    })
  }

  async function handleRejectInvite(inviteId: string) {
    await rejectInviteAction(inviteId)

    queryClient.invalidateQueries({
      queryKey: ['pending-invites'],
    })
  }

  const invites = data?.invites ?? []

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          <UserPlus2 className="size-4" />
          <span className="sr-only">Pending Invites</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 space-y-2">
        <span className="block text-sm font-medium">
          Pending Invites ({invites.length})
        </span>

        {data?.invites.length === 0 && (
          <p className="text-sm text-muted-foreground">No invites found</p>
        )}

        {invites.map((invite) => (
          <div className="space-y-2" key={invite.id}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">
                {invite.author?.name ?? 'Someone'}
              </span>
              &nbsp;invited you to join&nbsp;
              <span className="font-medium text-foreground">
                {invite.organization?.name}
              </span>
              &nbsp;
              <span>{dayjs(invite.createdAt).fromNow()}</span>
            </p>

            <div className="gap1 flex">
              <Button
                size="xs"
                variant="outline"
                onClick={() => handleAcceptInvite(invite.id)}
              >
                <Check className="mr-1.5 size-3" />
                Accept
              </Button>
              <Button
                size="xs"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => handleRejectInvite(invite.id)}
              >
                <X className="mr-1.5 size-3" />
                Revoke
              </Button>
            </div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
