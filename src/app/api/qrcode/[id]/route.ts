import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params

  try {
    const code = await prisma.dynamicCode.findUnique({ where: { id } })
    if (!code || code.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ code })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = req.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { id } = await params

  try {
    const code = await prisma.dynamicCode.findUnique({ where: { id } })
    if (!code || code.user_id !== userId) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    const formData = await req.formData()
    const type = formData.get('type') as string
    const linkUrl = formData.get('linkUrl') as string
    const imageFile = formData.get('imageFile') as File | null

    let targetContent = code.target_content

    if (type === 'LINK') {
      if (!linkUrl) return NextResponse.json({ error: 'Link URL is required' }, { status: 400 })
      targetContent = linkUrl
    } else if (type === 'IMAGE') {
      if (imageFile) {
         // Upload new file
         const buffer = Buffer.from(await imageFile.arrayBuffer())
         const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
         const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`
         const uploadDir = path.join(process.cwd(), 'public/uploads')
         try { await mkdir(uploadDir, { recursive: true }) } catch (e) {}
         await writeFile(path.join(uploadDir, filename), buffer)
         targetContent = `/uploads/${filename}`
      }
      else if (code.type !== 'IMAGE') {
          return NextResponse.json({ error: 'Image file is required when switching to Image type' }, { status: 400 })
      }
    }

    const updated = await prisma.dynamicCode.update({
      where: { id },
      data: {
        type,
        target_content: targetContent,
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, code: updated })

  } catch (error) {
    console.error('Update QR error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
