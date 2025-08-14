import { handleAuth, handleLogin, handleCallback, handleLogout } from '@auth0/nextjs-auth0'
import { NextApiRequest, NextApiResponse } from 'next'

interface SessionUser {
  sub?: string
  email?: string
  name?: string
  role?: string
}

interface Session {
  user: SessionUser
}

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      scope: 'openid profile email'
    }
  }),
  
  callback: handleCallback({
    afterCallback: async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
      if (!session?.user) {
        return session
      }
      
      const state = req.query.state as string
      let userRole: 'CARE_WORKER' | 'MANAGER' = 'CARE_WORKER'
      
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
  }),
  
  logout: handleLogout({
    returnTo: process.env.AUTH0_BASE_URL
  })
})

export const POST = GET
