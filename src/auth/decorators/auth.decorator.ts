import { SetMetadata } from '@nestjs/common'
import { AUTH_OPTIONS_KEY } from '../../utils/constants'
import { AuthOptions } from '../../utils/types'

export const Auth = (options?: AuthOptions) => {
  const final: AuthOptions = {
    isOpen: options?.isOpen ?? false,
    refresh: options?.refresh ?? false,
    roles: options?.roles ?? [],
  }

  return SetMetadata(AUTH_OPTIONS_KEY, final)
}
