import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: (req) => {
      const url = new URL(req.url)
      const connection = url.searchParams.get('connection')
      const state = url.searchParams.get('state')
      
      console.log('Login params:', { connection, state })
      
      const params = {}
      if (connection) params.connection = connection
      if (state) params.state = state
      
      return params
    }
  }),
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      console.log('Callback received, session:', session)
      
      // The state parameter should be available in the request
      const url = new URL(req.url)
      const state = url.searchParams.get('state')
      
      console.log('State parameter:', state)
      
      if (state) {
        try {
          // Decode the state parameter
          const decodedState = decodeURIComponent(state)
          console.log('Decoded state:', decodedState)
          
          const stateData = JSON.parse(decodedState)
          console.log('Parsed state data:', stateData)
          
          if (stateData.role) {
            // Add role to the user session
            const updatedSession = {
              ...session,
              user: {
                ...session.user,
                role: stateData.role
              }
            }
            console.log('Updated session with role:', updatedSession.user.role)
            return updatedSession
          }
        } catch (e) {
          console.error('Failed to parse state in callback:', e)
        }
      }
      
      // Default role if no state or parsing failed
      const defaultSession = {
        ...session,
        user: {
          ...session.user,
          role: 'CARE_WORKER'
        }
      }
      
      console.log('Returning session:', defaultSession)
      return defaultSession
    }
  })
})

export const POST = GET
