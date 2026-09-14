import { NextRequest, NextResponse } from 'next/server'
import { getSql } from '@/lib/db'

export const runtime = 'nodejs'

function genOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000)
  const ts = Date.now().toString().slice(-6)
  return `AT-${ts}${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const sql = getSql()
    const body = await req.json()
    const {
      customer_name,
      phone,
      email,
      address,
      city,
      notes,
      payment_method,
      items
    } = body

    if (!customer_name || !phone || !address || !city || !Array.isArray(items) || !items.length) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Re-validate prices from DB
    let subtotal = 0
    const validated: any[] = []
    for (const item of items) {
      const rows = await sql`SELECT id, name, price, sale_price, stock FROM products WHERE id = ${item.product_id} LIMIT 1`
      if (!rows.length) {
        return NextResponse.json({ success: false, error: `Product not found: ${item.product_id}` }, { status: 400 })
      }
      const p = rows[0] as any
      const unit = Number(p.sale_price ?? p.price)
      const qty = Math.max(1, Number(item.quantity) || 1)
      subtotal += unit * qty
      validated.push({
        product_id: p.id,
        product_name: p.name,
        size: item.size || null,
        color: item.color || null,
        quantity: qty,
        unit_price: unit
      })
    }

    const shipping = subtotal >= 15000 ? 0 : 0
    const total = subtotal + shipping
    const orderNumber = genOrderNumber()

    const orderRows = await sql`
      INSERT INTO orders (order_number, customer_name, phone, email, address, city, notes, payment_method, subtotal, shipping_fee, total, status)
      VALUES (
        ${orderNumber}, ${customer_name}, ${phone}, ${email || null},
        ${address}, ${city}, ${notes || null}, ${payment_method || 'COD'},
        ${subtotal}, ${shipping}, ${total}, 'pending'
      )
      RETURNING id, order_number
    `
    const order = orderRows[0] as any

    for (const v of validated) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, size, color, quantity, unit_price)
        VALUES (${order.id}, ${v.product_id}, ${v.product_name}, ${v.size}, ${v.color}, ${v.quantity}, ${v.unit_price})
      `
    }

    return NextResponse.json({
      success: true,
      data: { order_number: order.order_number, total }
    })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
