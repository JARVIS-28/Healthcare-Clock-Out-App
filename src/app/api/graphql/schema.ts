import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type User {
    id: String!
    auth0Id: String!
    email: String!
    name: String
    role: UserRole!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    organization: Organization
    clockEntries: [ClockEntry!]!
  }

  type Organization {
    id: String!
    name: String!
    description: String
    centerLat: Float!
    centerLng: Float!
    radiusKm: Float!
    createdAt: String!
    updatedAt: String!
    users: [User!]!
    clockEntries: [ClockEntry!]!
  }

  type ClockEntry {
    id: String!
    user: User!
    organization: Organization!
    status: ClockStatus!
    timestamp: String!
    latitude: Float!
    longitude: Float!
    locationName: String
    note: String
    createdAt: String!
    updatedAt: String!
  }

  type AnalyticsSummary {
    id: String!
    organizationId: String!
    date: String!
    totalUsers: Int!
    totalClockIns: Int!
    totalClockOuts: Int!
    avgHoursWorked: Float!
    totalHoursWorked: Float!
  }

  enum UserRole {
    CARE_WORKER
    MANAGER
    ADMIN
  }

  enum ClockStatus {
    CLOCKED_IN
    CLOCKED_OUT
  }

  type DashboardStats {
    avgHoursPerDay: Float!
    totalClockInsToday: Int!
    totalHoursThisWeek: Float!
    activeUsersCount: Int!
  }

  type LocationCheckResult {
    isWithinPerimeter: Boolean!
    distance: Float!
    message: String!
  }

  input ClockActionInput {
    latitude: Float!
    longitude: Float!
    note: String
  }

  type Query {
    # User queries
    me: User
    getUsers: [User!]!
    getClockedInUsers: [User!]!
    
    # Organization queries
    getOrganization: Organization
    
    # Clock entry queries
    getMyClockEntries(limit: Int, offset: Int): [ClockEntry!]!
    getUserClockEntries(userId: String!, limit: Int, offset: Int): [ClockEntry!]!
    getAllClockEntries(limit: Int, offset: Int): [ClockEntry!]!
    
    # Analytics queries
    getDashboardStats: DashboardStats!
    getAnalyticsSummary(startDate: String!, endDate: String!): [AnalyticsSummary!]!
    
    # Location queries
    checkLocationPerimeter(latitude: Float!, longitude: Float!): LocationCheckResult!
  }

  type Mutation {
    # Clock actions
    clockIn(input: ClockActionInput!): ClockEntry!
    clockOut(input: ClockActionInput!): ClockEntry!
    
    # Organization management
    updateOrganizationPerimeter(centerLat: Float!, centerLng: Float!, radiusKm: Float!): Organization!
    
    # User management
    updateUserRole(userId: String!, role: UserRole!): User!
    deactivateUser(userId: String!): User!
  }
`
