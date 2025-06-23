import { api } from './api-client'

interface CreateOrganizationRequest {
  name: string
  domain: string | null
  shouldAttatchUsersByDomain: boolean
}

type CreateOrganizationResponse = void

export async function createOrganization({
  name,
  domain,
  shouldAttatchUsersByDomain,
}: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
  await api.post('organizations', {
    json: { name, domain, shouldAttatchUsersByDomain },
  })
}
