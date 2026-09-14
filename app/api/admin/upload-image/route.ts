import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'

/**
 * Image upload stub for Vercel free tier.
 * Paste a public image URL in the product form instead
 * (ImgBB, Cloudinary, Drive public link, etc.).
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    success: false,
    error:
      'File upload needs cloud storage. For now paste a public image URL in the Image field (ImgBB / Cloudinary free), or use a gradient like grad-maroon.'
  }, { status: 400 })
}
