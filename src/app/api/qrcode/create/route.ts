import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const type = formData.get('type') as string // 'LINK' or 'IMAGE'
    const linkUrl = formData.get('linkUrl') as string
    const imageFile = formData.get('imageFile') as File | null

    // 1. Check Points
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.points < 10) {
      return NextResponse.json({ error: 'Insufficient points (Need 10)' }, { status: 403 })
    }

    let targetContent = ''

    // 2. Handle Content
    if (type === 'LINK') {
      if (!linkUrl) return NextResponse.json({ error: 'Link URL is required' }, { status: 400 })
      targetContent = linkUrl
    } else if (type === 'IMAGE') {
      if (!imageFile) return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
      
      // Save file
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      // Sanitize filename
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      
      // Ensure dir exists
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (e) {
        // ignore if exists
      }
      
      await writeFile(path.join(uploadDir, filename), buffer)
      targetContent = `/uploads/${filename}`
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // 3. Generate Short Code
    let shortCode = ''
    let isUnique = false
    while (!isUnique) {
      shortCode = Math.random().toString(36).substring(2, 8)
      const exists = await prisma.dynamicCode.findUnique({ where: { short_code: shortCode } })
      if (!exists) isUnique = true
    }

    // 4. Transaction: Create Code & Deduct Points
    const newCode = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: 10 } }
      })
      
      return await tx.dynamicCode.create({
        data: {
          user_id: userId,
          short_code: shortCode,
          type,
          target_content: targetContent
        }
      })
    })

    return NextResponse.json({ success: true, code: newCode }, { status: 201 })

  } catch (error) {
    console.error('Create QR error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
