'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentProps } from 'react'

interface NavLinkProps extends ComponentProps<typeof Link> {}

export function NavLink(props: NavLinkProps) {
  const pathName = usePathname()

  const isCurrent = props.href.toString() === pathName

  console.log({ pathName, isCurrent, href: props.href })

  return <Link data-current={isCurrent} {...props} />
}
