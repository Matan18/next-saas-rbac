'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { getProjects } from '@/http/get-projects'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export function ProjectSwithcer() {
  const { slug: orgSlug } = useParams<{
    slug: string
  }>()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', orgSlug],
    queryFn: async () => getProjects(orgSlug),
    enabled: !!orgSlug,
  })

  console.log({ projects })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-[168px] items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {/* {currentOrganization ? (
          <>
            <Avatar className="mr-2 size-4">
              {currentOrganization.avatarUrl && (
                <AvatarImage src={currentOrganization.avatarUrl} />
              )}
              <AvatarFallback />
            </Avatar>

            <span className="truncate">{currentOrganization.name}</span>
          </>
        ) : ( */}
        <span className="text-muted-foreground">Select Project</span>
        {/* )}  */}

        <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-16}
        className="w-[200px]"
        sideOffset={12}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Organization</DropdownMenuLabel>

          {/* {organizations.map((organization) => ( */}
          <DropdownMenuItem asChild>
            <Link href="" /* href={`/org/${organization.slug}`} */>
              <Avatar className="mr-2 size-4">
                {/* {organization.avatarUrl && (
                    <AvatarImage src={organization.avatarUrl} />
                  )} */}
                <AvatarFallback />
              </Avatar>

              <span className="truncate">Projeto Teste</span>
            </Link>
          </DropdownMenuItem>
          {/* ))} */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="">
            <Plus className="mr-2 size-4" />
            Create new
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
