/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
// import { useUser } from '@auth0/nextjs-auth0/client' // Commented for now

interface User {
  id: string
  auth0Id: string
  email: string
  name?: string
  role: 'CARE_WORKER' | 'MANAGER' 
  isActive: boolean
  organization?: Organization
}

interface Organization {
  id: string
  name: string
  centerLat: number
  centerLng: number
  radiusKm: number
}

interface ClockEntry {
  id: string
  status: 'CLOCKED_IN' | 'CLOCKED_OUT'
  timestamp: string
  latitude: number
  longitude: number
  note?: string
}

interface AppState {
  user: User | null
  organization: Organization | null
  currentLocation: { latitude: number; longitude: number } | null
  isLocationLoading: boolean
  clockEntries: ClockEntry[]
  isWithinPerimeter: boolean | null
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ORGANIZATION'; payload: Organization | null }
  | { type: 'SET_LOCATION'; payload: { latitude: number; longitude: number } }
  | { type: 'SET_LOCATION_LOADING'; payload: boolean }
  | { type: 'SET_CLOCK_ENTRIES'; payload: ClockEntry[] }
  | { type: 'ADD_CLOCK_ENTRY'; payload: ClockEntry }
  | { type: 'SET_PERIMETER_STATUS'; payload: boolean }

const initialState: AppState = {
  user: null,
  organization: null,
  currentLocation: null,
  isLocationLoading: false,
  clockEntries: [],
  isWithinPerimeter: null,
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_ORGANIZATION':
      return { ...state, organization: action.payload }
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.payload, isLocationLoading: false }
    case 'SET_LOCATION_LOADING':
      return { ...state, isLocationLoading: action.payload }
    case 'SET_CLOCK_ENTRIES':
      return { ...state, clockEntries: action.payload }
    case 'ADD_CLOCK_ENTRY':
      return { ...state, clockEntries: [action.payload, ...state.clockEntries] }
    case 'SET_PERIMETER_STATUS':
      return { ...state, isWithinPerimeter: action.payload }
    default:
      return state
  }
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  getCurrentLocation: () => Promise<void>
  checkPerimeter: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  // const { user: auth0User } = useUser() // Using JS route for Auth0 instead

  // Function to get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.')
      return
    }

    dispatch({ type: 'SET_LOCATION_LOADING', payload: true })

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          })
          resolve()
        },
        (error) => {
          console.error('Error getting location:', error)
          dispatch({ type: 'SET_LOCATION_LOADING', payload: false })
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      )
    })
  }

  // Function to check if current location is within perimeter
  const checkPerimeter = async () => {
    if (!state.currentLocation || !state.organization) {
      return
    }

    try {
      // Calculate distance
      const distance = calculateDistance(
        state.currentLocation.latitude,
        state.currentLocation.longitude,
        state.organization.centerLat,
        state.organization.centerLng
      )

      const isWithin = distance <= state.organization.radiusKm
      dispatch({ type: 'SET_PERIMETER_STATUS', payload: isWithin })
    } catch (error) {
      console.error('Error checking perimeter:', error)
    }
  }

  // Helper function to calculate distance
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  // Effect to check perimeter when location or organization changes
  useEffect(() => {
    if (state.currentLocation && state.organization) {
      checkPerimeter()
    }
  }, [state.currentLocation, state.organization])

  return (
    <AppContext.Provider value={{ state, dispatch, getCurrentLocation, checkPerimeter }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
