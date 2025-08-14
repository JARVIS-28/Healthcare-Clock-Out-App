import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: (req) => {
      const url = new URL(req.url)
      const connection = url.searchParams.get('connection')
      const state = url.searchParams.get('state')
      
      const params = {}
      if (connection) params.connection = connection
      if (state) params.state = state
      
      return params
    }
  }),
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      // Try to get role from state parameter in the callback URL
      const url = new URL(req.url)
      const state = url.searchParams.get('state')
      
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state))
          if (stateData.role) {
            // Add role to the user session
            session.user = {
              ...session.user,
              role: stateData.role
            }
          }
        } catch (e) {
          console.error('Failed to parse state in callback:', e)
        }
      }
      
      return session
    }
  })
})

export const POST = GET
