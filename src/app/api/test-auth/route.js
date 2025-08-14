import { getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    console.log('🧪 Testing Auth0 session...')
    console.log('🔍 Request URL:', request.url)
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()))
    
    const session = await getSession(request)
    
    console.log('📋 Raw session data:', session)
    
    if (session) {
      console.log('✅ Session found!')
      console.log('👤 User:', session.user)
    } else {
      console.log('❌ No session found')
    }
    
    // Check environment variables
    const envCheck = {
      AUTH0_SECRET: process.env.AUTH0_SECRET ? '✅ Present' : '❌ Missing',
      AUTH0_BASE_URL: process.env.AUTH0_BASE_URL || '❌ Missing',
      AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || '❌ Missing',
      AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID ? '✅ Present' : '❌ Missing',
      AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET ? '✅ Present' : '❌ Missing'
    }
    
    console.log('🔧 Environment variables:', envCheck)
    
    return NextResponse.json({
      success: true,
      session: session,
      user: session?.user || null,
      isAuthenticated: !!session,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      cookies: request.headers.get('cookie') ? '✅ Present' : '❌ Missing',
      userAgent: request.headers.get('user-agent') || 'Unknown'
    })
  } catch (error) {
    console.error('❌ Test-auth error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      session: null,
      isAuthenticated: false
    })
  }
}
