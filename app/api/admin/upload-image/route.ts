import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireAdminFromRequest } from '@/lib/auth'

/**
 * Real image upload via Vercel Blob storage.
 * Accepts a multipart/form-data POST with a "file" field
 * and returns the public URL of the uploaded image.
 */
export const runtime = 'nodejs'

const MAX_BYTES = 4.5 * 1024 * 1024 // 4.5MB — Vercel serverless function body limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  if (!(await requireAdminFromRequest(req))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Only JPG, PNG, WEBP or GIF images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image too large — max 4.5MB per file' },
        { status: 400 }
      )
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'jpg'
    const pathname = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
