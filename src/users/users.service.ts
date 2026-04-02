import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { ListUsersDto } from './dtos/list-users.dto'
import { User } from 'src/utils/types'
import { Role, Status } from 'generated/prisma/enums'

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async list(query: ListUsersDto, user: User) {
    const limit = query.limit ?? 10

    const users = await this.db.user.findMany({
      where: { id: { not: user.id }, role: query.role ?? Role.user, status: query.status ?? Status.active },
      cursor: query.cursor ? { id: query.cursor } : undefined,
      take: limit + 1,
      orderBy: [{ createdAt: 'asc' }, { updatedAt: 'asc' }],
      omit: { refresh: true },
    })

    let cursor: string | null = null
    if (users.length > limit) {
      const next = users.pop()!
      cursor = next.id
    }

    return { users, cursor }
  }
}
