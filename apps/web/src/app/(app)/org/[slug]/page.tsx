import { auth } from '@/auth/auth'
import { Header } from '@/components/header'

export default async function Projects() {
  const { user } = await auth()

  return (
    <div className="py-4">
      <Header />
      <main></main>
    </div>
  )
}
