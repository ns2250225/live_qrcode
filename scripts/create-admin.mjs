import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Usage: node scripts/create-admin.mjs <email> <password>')
    process.exit(1)
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`User ${email} exists. Updating role to ADMIN...`)
      await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN', password: hashedPassword } // Update password too
      })
      console.log('User updated successfully.')
    } else {
      console.log(`Creating new Admin user ${email}...`)
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN',
          ip_address: '127.0.0.1', // Placeholder
          referral_code: referralCode,
          points: 9999 // Admin gets lots of points? Or standard 20. Let's give 9999
        }
      })
      console.log('Admin user created successfully.')
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
