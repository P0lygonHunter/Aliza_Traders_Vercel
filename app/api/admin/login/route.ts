import { NextRequest, NextResponse } from 'next/server'
import { createToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    const validUser = process.env.ADMIN_USERNAME || 'admin'
    const validPass = process.env.ADMIN_PASSWORD || 'admin123'

    if (username !== validUser || password !== validPass) {
      return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 })
    }

    const token = await createToken(username)
    const res = NextResponse.json({ success: true })
    setAuthCookie(res, token)
    return res
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
