import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0'

// Auth0 configuration with proper error handling
const authHandlers = handleAuth({
  login: handleLogin({
    authorizationParams: (req) => {
      try {
        const url = new URL(req.url)
        const connection = url.searchParams.get('connection')
        const state = url.searchParams.get('state')
        
        console.log('🔐 Login initiated with params:', { connection, state })
        
        const params = {
          scope: 'openid profile email'
        }
        
        if (connection) {
          params.connection = connection
        }
        
        if (state) {
          params.state = state
        }
        
        console.log('🔐 Authorization params:', params)
        return params
      } catch (error) {
        console.error('❌ Login error:', error)
        return { scope: 'openid profile email' }
      }
    }
  }),
  
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      try {
        console.log('🔄 Callback received, processing session...')
        console.log('📋 Original session:', JSON.stringify(session, null, 2))
        
        if (!session || !session.user) {
          console.error('❌ No session or user in callback')
          throw new Error('No session or user data received')
        }
        
        // Get state parameter from URL
        const url = new URL(req.url)
        const state = url.searchParams.get('state')
        
        console.log('🔍 State parameter from URL:', state)
        
        let userRole = 'CARE_WORKER' // Default role
        
        if (state) {
          try {
            const decodedState = decodeURIComponent(state)
            console.log('🔓 Decoded state:', decodedState)
            
            const stateData = JSON.parse(decodedState)
            console.log('📊 Parsed state data:', stateData)
            
            if (stateData.role) {
              userRole = stateData.role
              console.log('✅ Role extracted from state:', userRole)
            }
          } catch (parseError) {
            console.warn('⚠️ Failed to parse state, using default role:', parseError.message)
          }
        }
        
        // Create enhanced session with role
        const enhancedSession = {
          ...session,
          user: {
            ...session.user,
            role: userRole,
            // Ensure email is present
            email: session.user.email || session.user.name,
            // Add timestamp
            loginTime: new Date().toISOString()
          }
        }
        
        console.log('✅ Enhanced session created:', JSON.stringify(enhancedSession.user, null, 2))
        return enhancedSession
        
      } catch (error) {
        console.error('❌ Callback error:', error)
        
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

export const GET = authHandlers
export const POST = authHandlers
