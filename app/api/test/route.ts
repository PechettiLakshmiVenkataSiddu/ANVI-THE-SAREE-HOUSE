import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        keyId: process.env.RAZORPAY_KEY_ID ? "EXISTS" : "MISSING",
        keySecret: process.env.RAZORPAY_KEY_SECRET ? "EXISTS" : "MISSING",
    })
}