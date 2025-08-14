import { NextResponse } from 'next/server'

export async function GET(request, context) {
  const { params } = context
  const auth0Route = params.auth0?.join('/') || ''
  
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://clock-out-app.vercel.app'
  const domain = process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-zdhknxi00po7vryi.us.auth0.com'
  const clientId = process.env.AUTH0_CLIENT_ID || 'g89SPTPrIPJ8PJhxMZrLcq4cxKY9VOGV'

  if (auth0Route === 'login') {
    // Handle login
    const connection = request.nextUrl.searchParams.get('connection') || ''
    const connectionParam = connection ? `&connection=${connection}` : ''
    
    const authUrl = `${domain}/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(baseUrl + '/api/auth/callback')}&` +
      `scope=openid profile email${connectionParam}`
    
    return NextResponse.redirect(authUrl)
  }
  
  if (auth0Route === 'logout') {
    // Handle logout
    const logoutUrl = `${domain}/v2/logout?` +
      `client_id=${clientId}&` +
      `returnTo=${encodeURIComponent(baseUrl)}`
    
    return NextResponse.redirect(logoutUrl)
  }
  
  if (auth0Route === 'callback') {
    // Handle callback - redirect to home for now
    return NextResponse.redirect(baseUrl)
  }
  
  if (auth0Route === 'me') {
    // Return user info if available
    return NextResponse.json({ user: null })
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request, context) {
  return GET(request, context)
}
