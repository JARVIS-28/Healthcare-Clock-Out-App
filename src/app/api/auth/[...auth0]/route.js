import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request, context) {
  const { params } = context
  const auth0Route = params.auth0?.join('/') || ''
  
  const baseUrl = process.env.AUTH0_BASE_URL || 'https://clock-out-app.vercel.app'
  const domain = process.env.AUTH0_ISSUER_BASE_URL || 'https://dev-zdhknxi00po7vryi.us.auth0.com'
  const clientId = process.env.AUTH0_CLIENT_ID || 'g89SPTPrIPJ8PJhxMZrLcq4cxKY9VOGV'
  const clientSecret = process.env.AUTH0_CLIENT_SECRET

  if (auth0Route === 'login') {
    // Handle login
    const connection = request.nextUrl.searchParams.get('connection') || ''
    const state = request.nextUrl.searchParams.get('state') || ''
    
    const connectionParam = connection ? `&connection=${connection}` : ''
    const stateParam = state ? `&state=${encodeURIComponent(state)}` : ''
    
    const authUrl = `${domain}/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(baseUrl + '/api/auth/callback')}&` +
      `scope=openid profile email${connectionParam}${stateParam}`
    
    return NextResponse.redirect(authUrl)
  }
  
  if (auth0Route === 'logout') {
    // Handle logout - clear cookies
    const response = NextResponse.redirect(`${domain}/v2/logout?` +
      `client_id=${clientId}&` +
      `returnTo=${encodeURIComponent(baseUrl)}`)
    
    // Clear auth cookies
    response.cookies.delete('auth0_access_token')
    response.cookies.delete('auth0_user')
    
    return response
  }
  
  if (auth0Route === 'callback') {
    // Handle Auth0 callback
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    
    console.log('Auth0 callback received:', { code: code ? 'present' : 'missing', state })
    
    if (!code) {
      console.error('Missing authorization code in callback')
      return NextResponse.redirect(`${baseUrl}?error=missing_code`)
    }

    try {
      console.log('Attempting token exchange with Auth0...')
      
      // Exchange code for tokens
      const tokenResponse = await fetch(`${domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${baseUrl}/api/auth/callback`,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Token exchange failed:', tokenResponse.status, errorText)
        return NextResponse.redirect(`${baseUrl}?error=token_exchange_failed&details=${encodeURIComponent(errorText)}`)
      }

      const tokens = await tokenResponse.json()
      console.log('Token exchange successful')
      
      // Get user info
      const userResponse = await fetch(`${domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('User info fetch failed:', userResponse.status, errorText)
        return NextResponse.redirect(`${baseUrl}?error=user_info_failed&details=${encodeURIComponent(errorText)}`)
      }

      const user = await userResponse.json()
      console.log('User info retrieved:', { email: user.email, sub: user.sub })
      
      // Store user and tokens in cookies
      const response = NextResponse.redirect(baseUrl)
      response.cookies.set('auth0_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
      })
      response.cookies.set('auth0_user', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
      })
      
      // Store the role from state if available
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state))
          if (stateData.role) {
            console.log('Setting user role:', stateData.role)
            response.cookies.set('user_role', stateData.role, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              maxAge: 60 * 60 * 24 * 7, // 7 days
              sameSite: 'lax'
            })
          }
        } catch (e) {
          console.error('Failed to parse state:', e)
        }
      }
      
      console.log('Callback completed successfully, redirecting to home')
      return response
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${baseUrl}?error=callback_failed&details=${encodeURIComponent(error.message)}`)
    }
  }
  
  if (auth0Route === 'me') {
    // Return user info from cookies
    try {
      const cookieStore = cookies()
      const userCookie = cookieStore.get('auth0_user')
      const roleCookie = cookieStore.get('user_role')
      
      console.log('Me endpoint called - cookies:', { 
        hasUser: !!userCookie, 
        hasRole: !!roleCookie,
        role: roleCookie?.value 
      })
      
      if (!userCookie) {
        return NextResponse.json(null)
      }
      
      const user = JSON.parse(userCookie.value)
      const role = roleCookie?.value || 'CARE_WORKER'
      
      const userWithRole = {
        ...user,
        role
      }
      
      console.log('Returning user:', { email: user.email, role })
      return NextResponse.json(userWithRole)
    } catch (error) {
      console.error('Failed to parse user cookie:', error)
      return NextResponse.json(null)
    }
  }
  
  if (auth0Route === 'debug') {
    // Debug endpoint to see what's happening
    const cookieStore = cookies()
    const userCookie = cookieStore.get('auth0_user')
    const roleCookie = cookieStore.get('user_role')
    const tokenCookie = cookieStore.get('auth0_access_token')
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      baseUrl,
      domain,
      clientId,
      hasClientSecret: !!clientSecret,
      cookies: {
        hasUser: !!userCookie,
        hasRole: !!roleCookie,
        hasToken: !!tokenCookie,
        role: roleCookie?.value,
        userEmail: userCookie ? JSON.parse(userCookie.value).email : null
      }
    })
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request, context) {
  return GET(request, context)
}
