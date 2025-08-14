import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: async (req: any, res: any, session: any) => {
      if (!session?.user) {
        return session
      }
      
      // Get the state parameter from the URL
      const url = new URL(req.url || '')
      const state = url.searchParams.get('state')
      
      let userRole = 'CARE_WORKER'
      
      if (state) {
        try {
          const stateData = JSON.parse(decodeURIComponent(state))
          if (stateData.role) {
            userRole = stateData.role
          }
        } catch {
          // Use default role
        }
      }
      
      return {
        ...session,
        user: {
          ...session.user,
          role: userRole
        }
      }
    }
  })
})

export const POST = GET
