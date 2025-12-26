import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params

  try {
    const dynamicCode = await prisma.dynamicCode.findUnique({
      where: { short_code: code }
    })

    if (!dynamicCode || !dynamicCode.active) {
      return new NextResponse('Not Found or Inactive', { status: 404 })
    }

    // Update visits (Non-blocking / Fail-safe)
    try {
      await prisma.dynamicCode.update({
        where: { id: dynamicCode.id },
        data: { visits: { increment: 1 } }
      })
    } catch (e) {
      console.error('Failed to update visits:', e)
      // Continue to redirect even if stats fail
    }

    // Handle redirection
    let target = dynamicCode.target_content
    
    // Construct absolute URL for internal paths (like images)
    if (target.startsWith('/')) {
        const host = req.headers.get('host') || 'localhost:3000'
        const protocol = req.headers.get('x-forwarded-proto')?.split(',')[0] || 'http'
        target = `${protocol}://${host}${target}`
    } else if (!target.startsWith('http')) {
        // Fallback for missing protocol in external links
        target = `https://${target}`
    }

    // Return redirect with no-cache headers
    return NextResponse.redirect(target, {
        status: 302, // 302 Found (Temporary Redirect) - Better compatibility for "Direct Jump"
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    })
    
  } catch (error) {
    console.error('Redirect error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
