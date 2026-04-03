import { PaymentType, Role } from 'generated/prisma/enums'

export type HttpResponse = Promise<{
  success: boolean
  message?: string
  error?: string
  data?: Record<string, any>
}>

export type AuthOptions = {
  refresh?: boolean
  isOpen?: boolean
  roles?: Role[]
}

export type User = {
  id: string
  role: Role
}

export enum Interval {
  week = 'week',
  month = 'month',
}

export type TrendData = {
  period: Date
  type: PaymentType
  total: number
}

export type ChartData = {
  period: Date
  income: number
  expense: number
}
