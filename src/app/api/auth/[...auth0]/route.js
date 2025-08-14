import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: (req) => {
      try {
        const url = new URL(req.url)
        const connection = url.searchParams.get('connection')
        const state = url.searchParams.get('state')
        
        const params = {
          scope: 'openid profile email'
        }
        
        if (connection) {
          params.connection = connection
        }
        
        if (state) {
          params.state = state
        }
        
        return params
      } catch (error) {
        console.error('Login error:', error)
        return { scope: 'openid profile email' }
      }
    }
  }),
  
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      try {
        if (!session || !session.user) {
          throw new Error('No session or user data received')
        }
        
        // Get state parameter from URL
        const url = new URL(req.url)
        const state = url.searchParams.get('state')
        
        let userRole = 'CARE_WORKER' // Default role
        
        if (state) {
          try {
            const decodedState = decodeURIComponent(state)
            const stateData = JSON.parse(decodedState)
            
            if (stateData.role) {
              userRole = stateData.role
            }
          } catch (parseError) {
            console.warn('Failed to parse state, using default role:', parseError.message)
          }
        }
        
        // Create enhanced session with role
        const enhancedSession = {
          ...session,
          user: {
            ...session.user,
            role: userRole,
            email: session.user.email || session.user.name,
            loginTime: new Date().toISOString()
          }
        }
        
        return enhancedSession
        
      } catch (error) {
        console.error('Callback error:', error)
        
        // Return a minimal session to prevent complete failure
        return {
          ...session,
          user: {
            ...session.user,
            role: 'CARE_WORKER',
            email: session.user?.email || session.user?.name || 'unknown@example.com',
            loginTime: new Date().toISOString()
          }
        }
      }
    }
  }),
  
  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL || 'http://localhost:3001'
  })
})

export const POST = GET
