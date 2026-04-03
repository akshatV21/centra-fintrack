import { faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  console.log('Starting database seed...')

  await prisma.payment.deleteMany()
  await prisma.category.deleteMany()
  await prisma.ledger.deleteMany()

  const categoryNames = [
    'General',
    'Travel',
    'Payroll',
    'Food',
    'Drink',
    'Grocery',
    'Marketing',
    'Software',
    'Hosting',
    'Office Supplies',
    'Legal',
    'Consulting',
    'Movies',
  ]

  const categories = await Promise.all(categoryNames.map(name => prisma.category.create({ data: { name } })))
  console.log('Categories created')

  let totalIncome = 0
  let totalExpense = 0
  const count = 5_000
  const paymentsToInsert: any[] = []

  for (let i = 0; i < count; i++) {
    const isExpense = Math.random() > 0.6
    const type = isExpense ? 'expense' : 'income'

    const date = faker.date.recent({ days: 2 * 365 })
    const amount = parseFloat(faker.finance.amount({ min: 10, max: 5000, dec: 2 }))

    const categoryId = faker.helpers.arrayElement(categories).id

    if (isExpense) totalExpense += amount
    else totalIncome += amount

    paymentsToInsert.push({ amount, type, date, categoryId })
  }

  await prisma.payment.createMany({ data: paymentsToInsert })
  console.log(`${count} Payments generated`)

  await prisma.ledger.create({
    data: { id: 'GLOBAL_LEDGER', income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense },
  })

  console.log('Global Ledger synchronized')
  console.log('Seeding finished successfully!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
