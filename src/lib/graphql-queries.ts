import { gql } from '@apollo/client'

// User queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      auth0Id
      email
      name
      role
      isActive
      createdAt
      organization {
        id
        name
        centerLat
        centerLng
        radiusKm
      }
    }
  }
`

export const GET_USERS = gql`
  query GetUsers {
    getUsers {
      id
      email
      name
      role
      isActive
      createdAt
    }
  }
`

export const GET_CLOCKED_IN_USERS = gql`
  query GetClockedInUsers {
    getClockedInUsers {
      id
      email
      name
      role
      clockEntries {
        id
        status
        timestamp
        latitude
        longitude
        note
      }
    }
  }
`

// Clock entry queries
export const GET_MY_CLOCK_ENTRIES = gql`
  query GetMyClockEntries($limit: Int, $offset: Int) {
    getMyClockEntries(limit: $limit, offset: $offset) {
      id
      status
      timestamp
      latitude
      longitude
      locationName
      note
      user {
        id
        name
        email
      }
    }
  }
`

export const GET_ALL_CLOCK_ENTRIES = gql`
  query GetAllClockEntries($limit: Int, $offset: Int) {
    getAllClockEntries(limit: $limit, offset: $offset) {
      id
      status
      timestamp
      latitude
      longitude
      locationName
      note
      user {
        id
        name
        email
        role
      }
      organization {
        id
        name
      }
    }
  }
`

// Analytics queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    getDashboardStats {
      avgHoursPerDay
      totalClockInsToday
      totalHoursThisWeek
      activeUsersCount
    }
  }
`

// Location queries
export const CHECK_LOCATION_PERIMETER = gql`
  query CheckLocationPerimeter($latitude: Float!, $longitude: Float!) {
    checkLocationPerimeter(latitude: $latitude, longitude: $longitude) {
      isWithinPerimeter
      distance
      message
    }
  }
`

// Mutations
export const CLOCK_IN = gql`
  mutation ClockIn($input: ClockActionInput!) {
    clockIn(input: $input) {
      id
      status
      timestamp
      latitude
      longitude
      note
      user {
        id
        name
        email
      }
    }
  }
`

export const CLOCK_OUT = gql`
  mutation ClockOut($input: ClockActionInput!) {
    clockOut(input: $input) {
      id
      status
      timestamp
      latitude
      longitude
      note
      user {
        id
        name
        email
      }
    }
  }
`

export const UPDATE_ORGANIZATION_PERIMETER = gql`
  mutation UpdateOrganizationPerimeter($centerLat: Float!, $centerLng: Float!, $radiusKm: Float!) {
    updateOrganizationPerimeter(centerLat: $centerLat, centerLng: $centerLng, radiusKm: $radiusKm) {
      id
      name
      centerLat
      centerLng
      radiusKm
    }
  }
`

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: String!, $role: UserRole!) {
    updateUserRole(userId: $userId, role: $role) {
      id
      email
      name
      role
    }
  }
`
