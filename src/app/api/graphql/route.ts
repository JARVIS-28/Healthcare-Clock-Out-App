// Temporarily disabled GraphQL API - will be re-enabled after frontend is working
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'GraphQL API temporarily disabled for demo' })
}

export async function POST() {
  return NextResponse.json({ message: 'GraphQL API temporarily disabled for demo' })
}
