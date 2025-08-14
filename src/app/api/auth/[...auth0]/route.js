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
    
    if (!code) {
      return NextResponse.redirect(`${baseUrl}?error=missing_code`)
    }

    try {
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
        console.error('Token exchange failed:', await tokenResponse.text())
        return NextResponse.redirect(`${baseUrl}?error=token_exchange_failed`)
      }

      const tokens = await tokenResponse.json()
      
      // Get user info
      const userResponse = await fetch(`${domain}/userinfo`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })

      if (!userResponse.ok) {
        console.error('User info fetch failed:', await userResponse.text())
        return NextResponse.redirect(`${baseUrl}?error=user_info_failed`)
      }

      const user = await userResponse.json()
      
      // Store user and tokens in cookies
      const response = NextResponse.redirect(baseUrl)
      response.cookies.set('auth0_access_token', tokens.access_token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      response.cookies.set('auth0_user', JSON.stringify(user), {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      
      // Store the role from state if available
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state))
          if (stateData.role) {
            response.cookies.set('user_role', stateData.role, {
              httpOnly: true,
              secure: true,
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
          }
        } catch (e) {
          console.error('Failed to parse state:', e)
        }
      }
      
      return response
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(`${baseUrl}?error=callback_failed`)
    }
  }
  
  if (auth0Route === 'me') {
    // Return user info from cookies
    const cookieStore = cookies()
    const userCookie = cookieStore.get('auth0_user')
    const roleCookie = cookieStore.get('user_role')
    
    if (!userCookie) {
      return NextResponse.json(null)
    }
    
    try {
      const user = JSON.parse(userCookie.value)
      const role = roleCookie?.value || 'CARE_WORKER'
      
      return NextResponse.json({
        ...user,
        role
      })
    } catch (error) {
      console.error('Failed to parse user cookie:', error)
      return NextResponse.json(null)
    }
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request, context) {
  return GET(request, context)
}
