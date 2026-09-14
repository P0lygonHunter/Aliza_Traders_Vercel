import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    const sql = getSql()
    await sql`
      INSERT INTO contact_messages (name, email, phone, message)
      VALUES (${name}, ${email}, ${phone || null}, ${message})
    `
    return NextResponse.json({ success: true, message: 'Message sent successfully!' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
