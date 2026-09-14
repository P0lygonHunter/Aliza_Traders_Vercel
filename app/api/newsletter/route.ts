import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !String(email).includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 })
    }
    const sql = getSql()
    try {
      await sql`INSERT INTO newsletter_subscribers (email) VALUES (${email})`
      return NextResponse.json({ success: true, message: 'Subscribed successfully!' })
    } catch {
      return NextResponse.json({ success: true, message: 'You are already subscribed!' })
    }
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
