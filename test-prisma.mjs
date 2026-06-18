import path from 'path'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const dbPath = path.resolve('./dev.db')
// Prisma 7 requires DATABASE_URL even with driver adapters
process.env.DATABASE_URL = `file:${dbPath}`
console.log('DB path:', dbPath)

const libsql = createClient({ url: `file:${dbPath}` })
const adapter = new PrismaLibSql(libsql)

// Dynamic import for ESM
const { PrismaClient } = await import('./app/generated/prisma/client.ts')
const prisma = new PrismaClient({ adapter })

try {
  const count = await prisma.user.count()
  console.log('User count:', count)
} catch (e) {
  console.error('Error:', e.message)
  console.error('Code:', e.code)
} finally {
  await prisma.$disconnect()
}
