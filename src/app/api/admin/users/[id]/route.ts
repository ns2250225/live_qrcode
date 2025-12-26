import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const role = req.headers.get('x-user-role')
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  
  try {
    const { points } = await req.json()
    
    if (typeof points !== 'number') {
        return NextResponse.json({ error: 'Invalid points' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { points }
    })

    return NextResponse.json({ success: true, user: updatedUser })

  } catch (error) {
    console.error('Update User error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
