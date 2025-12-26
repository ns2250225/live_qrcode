import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { email, password, referralCode } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1'

    // 1. Check IP uniqueness
    const existingIpUser = await prisma.user.findFirst({
      where: { ip_address: ip }
    })
    
    // Allow localhost loopback for testing if needed, but strictly enforce as per PRD
    // If testing locally, IP might be ::1 or 127.0.0.1. 
    // To avoid blocking myself during development if I restart DB, I'll keep it strict but be aware.
    if (existingIpUser) {
       // Check if env is development, maybe relax? No, PRD is strict.
       // But for "live_qrcode", I should respect PRD.
       // However, if I register once, I can't register again. That's fine.
       return NextResponse.json({ error: 'This IP has already registered an account.' }, { status: 403 })
    }

    // 2. Check Email uniqueness
    const existingEmailUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingEmailUser) {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 400 })
    }

    // 3. Referral Logic
    let inviterId: string | null = null
    if (referralCode) {
      const inviter = await prisma.user.findUnique({
        where: { referral_code: referralCode }
      })
      if (inviter) {
        inviterId = inviter.id
      }
    }

    // 4. Create User & Update Inviter (Transaction)
    const hashedPassword = await hashPassword(password)
    const newReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create new user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          ip_address: ip,
          referral_code: newReferralCode,
          invited_by: inviterId,
          points: 20 
        }
      })

      // If invited, add points to inviter
      if (inviterId) {
        await tx.user.update({
          where: { id: inviterId },
          data: { points: { increment: 10 } }
        })
      }

      return user
    })

    return NextResponse.json({ success: true, userId: result.id }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
