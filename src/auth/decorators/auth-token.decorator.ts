import { ExecutionContext, createParamDecorator } from '@nestjs/common'

export const AuthRefresh = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.refresh
})
