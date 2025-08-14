import { getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const session = await getSession(request)
    
    return NextResponse.json({
      success: true,
      session: session,
      user: session?.user || null,
      isAuthenticated: !!session,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      session: null,
      isAuthenticated: false,
      timestamp: new Date().toISOString()
    })
  }
}
