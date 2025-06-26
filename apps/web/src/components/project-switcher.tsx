'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronsUpDown, Loader2, Plus } from 'lucide-react'
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
import { Skeleton } from './ui/skeleton'

export function ProjectSwithcer() {
  const { slug: orgSlug, project: projectSlug } = useParams<{
    slug: string
    project?: string
  }>()

  const { data, isLoading } = useQuery({
    queryKey: ['projects', orgSlug],
    queryFn: async () => getProjects(orgSlug),
    enabled: !!orgSlug,
  })

  const projects = data?.projects

  const currentProject =
    projects?.find((project) => project.slug === projectSlug) || null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-[168px] items-center gap-2 rounded p-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-primary">
        {isLoading ? (
          <>
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </>
        ) : (
          <>
            {currentProject ? (
              <>
                <Avatar className="mr-2 size-4">
                  {currentProject.avatarUrl && (
                    <AvatarImage src={currentProject.avatarUrl} />
                  )}
                  <AvatarFallback />
                </Avatar>

                <span className="truncate">{currentProject.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Select Project</span>
            )}
          </>
        )}
        {isLoading ? (
          <Loader2 className="ml-auto size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <ChevronsUpDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-16}
        className="w-[200px]"
        sideOffset={12}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>

          {projects?.map((project) => (
            <DropdownMenuItem key={project.id} asChild>
              <Link href={`/org/${orgSlug}/project/${project.slug}`}>
                <Avatar className="mr-2 size-4">
                  {project.avatarUrl && <AvatarImage src={project.avatarUrl} />}
                  <AvatarFallback />
                </Avatar>

                <span className="truncate">{project.name}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/org/${orgSlug}/create-project`}>
            <Plus className="mr-2 size-4" />
            Create new
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
