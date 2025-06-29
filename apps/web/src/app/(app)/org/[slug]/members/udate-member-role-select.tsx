'use client'
import type { Role } from '@saas/auth'
import type { ComponentProps } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { updateMemberAction } from './actions'

interface UpdateMemberRoleSelectPrps extends ComponentProps<typeof Select> {
  memberId: string
}

export function UpdateMemberRoleSelect({
  memberId,
  ...props
}: UpdateMemberRoleSelectPrps) {
  async function updateMemberRole(role: Role) {
    await updateMemberAction(memberId, role)
  }

  return (
    <Select {...props} onValueChange={updateMemberRole}>
      <SelectTrigger className="h-8 w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">Admin</SelectItem>
        <SelectItem value="MEMBER">Member</SelectItem>
        <SelectItem value="BILLING">Billing</SelectItem>
      </SelectContent>
    </Select>
  )
}
