/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

interface Context {
  prisma: PrismaClient
  user: {
    sub: string
    email?: string
    name?: string
  } | null
}

interface GraphQLArgs {
  [key: string]: unknown
}

// Define enums locally to match Prisma schema
const UserRole = {
  CARE_WORKER: 'CARE_WORKER',
  MANAGER: 'MANAGER'
} as const

const ClockStatus = {
  CLOCKED_IN: 'CLOCKED_IN',
  CLOCKED_OUT: 'CLOCKED_OUT'
} as const

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: GraphQLArgs, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      return await prisma.user.findUnique({
        where: { auth0Id: user.sub },
        include: { organization: true, clockEntries: true }
      })
    },

    getUsers: async (_: unknown, __: GraphQLArgs, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role === 'CARE_WORKER') {
        throw new GraphQLError('Insufficient permissions')
      }

      return await prisma.user.findMany({
        where: { organizationId: currentUser.organizationId || undefined },
        include: { organization: true, clockEntries: true }
      })
    },

    getClockedInUsers: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role === 'CARE_WORKER') {
        throw new GraphQLError('Insufficient permissions')
      }

      // Get users with their latest clock entry being CLOCKED_IN
      const clockedInUsers = await prisma.user.findMany({
        where: {
          organizationId: currentUser.organizationId || undefined,
          clockEntries: {
            some: {
              status: ClockStatus.CLOCKED_IN,
              timestamp: {
                gte: startOfDay(new Date())
              }
            }
          }
        },
        include: {
          organization: true,
          clockEntries: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      })

      // Filter users whose latest entry is CLOCKED_IN
      return clockedInUsers.filter((user: any) => 
        user.clockEntries.length > 0 && 
        user.clockEntries[0].status === ClockStatus.CLOCKED_IN
      )
    },

    getOrganization: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser?.organizationId) {
        throw new GraphQLError('User not associated with an organization')
      }

      return await prisma.organization.findUnique({
        where: { id: currentUser.organizationId },
        include: { users: true, clockEntries: true }
      })
    },

    getMyClockEntries: async (_: any, { limit = 50, offset = 0 }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser) throw new GraphQLError('User not found')

      return await prisma.clockEntry.findMany({
        where: { userId: currentUser.id },
        include: { user: true, organization: true },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      })
    },

    getUserClockEntries: async (_: any, { userId, limit = 50, offset = 0 }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role === 'CARE_WORKER') {
        throw new GraphQLError('Insufficient permissions')
      }

      return await prisma.clockEntry.findMany({
        where: { 
          userId,
          organizationId: currentUser.organizationId || undefined
        },
        include: { user: true, organization: true },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      })
    },

    getAllClockEntries: async (_: any, { limit = 100, offset = 0 }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role === 'CARE_WORKER') {
        throw new GraphQLError('Insufficient permissions')
      }

      return await prisma.clockEntry.findMany({
        where: { organizationId: currentUser.organizationId || undefined },
        include: { user: true, organization: true },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      })
    },

    getDashboardStats: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role === 'CARE_WORKER') {
        throw new GraphQLError('Insufficient permissions')
      }

      const today = new Date()
      const weekStart = startOfWeek(today)
      const weekEnd = endOfWeek(today)
      const dayStart = startOfDay(today)
      const dayEnd = endOfDay(today)

      // Count today's clock-ins
      const totalClockInsToday = await prisma.clockEntry.count({
        where: {
          organizationId: currentUser.organizationId || undefined,
          status: ClockStatus.CLOCKED_IN,
          timestamp: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })

      // Count active users (users who clocked in/out this week)
      const activeUsersCount = await prisma.user.count({
        where: {
          organizationId: currentUser.organizationId || undefined,
          clockEntries: {
            some: {
              timestamp: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          }
        }
      })

      // Calculate average hours per day and total hours this week
      // This is a simplified calculation - in practice, you'd want more sophisticated logic
      const weeklyEntries = await prisma.clockEntry.findMany({
        where: {
          organizationId: currentUser.organizationId || undefined,
          timestamp: {
            gte: weekStart,
            lte: weekEnd
          }
        },
        orderBy: { timestamp: 'asc' }
      })

      let totalHoursThisWeek = 0
      let avgHoursPerDay = 0

      // Group by user and calculate hours
      const userHours = new Map()
      for (const entry of weeklyEntries) {
        if (!userHours.has(entry.userId)) {
          userHours.set(entry.userId, [])
        }
        userHours.get(entry.userId).push(entry)
      }

      userHours.forEach((entries) => {
        for (let i = 0; i < entries.length - 1; i += 2) {
          const clockIn = entries[i]
          const clockOut = entries[i + 1]
          if (clockIn.status === ClockStatus.CLOCKED_IN && clockOut?.status === ClockStatus.CLOCKED_OUT) {
            const hours = (new Date(clockOut.timestamp).getTime() - new Date(clockIn.timestamp).getTime()) / (1000 * 60 * 60)
            totalHoursThisWeek += hours
          }
        }
      })

      avgHoursPerDay = totalHoursThisWeek / 7

      return {
        avgHoursPerDay,
        totalClockInsToday,
        totalHoursThisWeek,
        activeUsersCount
      }
    },

    checkLocationPerimeter: async (_: any, { latitude, longitude }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub },
        include: { organization: true }
      })

      if (!currentUser?.organization) {
        throw new GraphQLError('User not associated with an organization')
      }

      const { organization } = currentUser
      const distance = calculateDistance(
        latitude,
        longitude,
        organization.centerLat,
        organization.centerLng
      )

      const isWithinPerimeter = distance <= organization.radiusKm

      return {
        isWithinPerimeter,
        distance,
        message: isWithinPerimeter 
          ? 'You are within the allowed area'
          : `You are ${distance.toFixed(2)}km away from the allowed area (max: ${organization.radiusKm}km)`
      }
    }
  },

  Mutation: {
    clockIn: async (_: any, { input }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub },
        include: { organization: true }
      })

      if (!currentUser?.organization) {
        throw new GraphQLError('User not associated with an organization')
      }

      // Check if user is within perimeter
      const distance = calculateDistance(
        input.latitude,
        input.longitude,
        currentUser.organization.centerLat,
        currentUser.organization.centerLng
      )

      if (distance > currentUser.organization.radiusKm) {
        throw new GraphQLError(`You are outside the allowed area. Distance: ${distance.toFixed(2)}km (max: ${currentUser.organization.radiusKm}km)`)
      }

      // Check if user is already clocked in
      const latestEntry = await prisma.clockEntry.findFirst({
        where: { userId: currentUser.id },
        orderBy: { timestamp: 'desc' }
      })

      if (latestEntry?.status === ClockStatus.CLOCKED_IN) {
        throw new GraphQLError('You are already clocked in')
      }

      return await prisma.clockEntry.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organizationId!,
          status: ClockStatus.CLOCKED_IN,
          latitude: input.latitude,
          longitude: input.longitude,
          note: input.note
        },
        include: { user: true, organization: true }
      })
    },

    clockOut: async (_: any, { input }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub },
        include: { organization: true }
      })

      if (!currentUser?.organization) {
        throw new GraphQLError('User not associated with an organization')
      }

      // Check if user is currently clocked in
      const latestEntry = await prisma.clockEntry.findFirst({
        where: { userId: currentUser.id },
        orderBy: { timestamp: 'desc' }
      })

      if (!latestEntry || latestEntry.status === ClockStatus.CLOCKED_OUT) {
        throw new GraphQLError('You are not currently clocked in')
      }

      return await prisma.clockEntry.create({
        data: {
          userId: currentUser.id,
          organizationId: currentUser.organizationId!,
          status: ClockStatus.CLOCKED_OUT,
          latitude: input.latitude,
          longitude: input.longitude,
          note: input.note
        },
        include: { user: true, organization: true }
      })
    },

    updateOrganizationPerimeter: async (_: any, { centerLat, centerLng, radiusKm }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role !== 'MANAGER') {
        throw new GraphQLError('Insufficient permissions')
      }

      if (!currentUser.organizationId) {
        throw new GraphQLError('User not associated with an organization')
      }

      return await prisma.organization.update({
        where: { id: currentUser.organizationId },
        data: { centerLat, centerLng, radiusKm },
        include: { users: true, clockEntries: true }
      })
    },

    updateUserRole: async (_: any, { userId, role }: any, { prisma, user }: Context) => {
      if (!user) throw new GraphQLError('Not authenticated')
      
      const currentUser = await prisma.user.findUnique({
        where: { auth0Id: user.sub }
      })

      if (!currentUser || currentUser.role !== 'ADMIN') {
        throw new GraphQLError('Insufficient permissions')
      }

      return await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: { organization: true, clockEntries: true }
      })
    }
  }
}
