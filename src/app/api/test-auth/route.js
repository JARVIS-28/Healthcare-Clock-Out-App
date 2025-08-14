import { getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const session = await getSession(request)
    
    return NextResponse.json({
      session: session,
      user: session?.user || null,
      isAuthenticated: !!session
    })
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      session: null,
      isAuthenticated: false
    })
  }
}
