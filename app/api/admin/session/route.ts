import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const payload = await requireAdminFromRequest(req)
  if (!payload) {
    return NextResponse.json({ success: false, authenticated: false })
  }
  return NextResponse.json({ success: true, authenticated: true })
}
