import { useState, useTransition, type FormEvent } from 'react'

interface FormState {
  success: boolean
  message: string | null
  errors: Record<string, string[]> | null
}

export function useFormState(
  action: (data: FormData) => Promise<FormState>,
  initialState: FormState = {
    success: false,
    message: null,
    errors: null,
  }
) {
  const [isPending, startTransition] = useTransition()
  const [state, setFormState] = useState(initialState)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    const data = new FormData(form)

    startTransition(async () => {
      const result = await action(data)
      setFormState(result)
    })
  }

  return [state, handleSubmit, isPending] as const
}
