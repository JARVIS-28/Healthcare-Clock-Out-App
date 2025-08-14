'use client'

import { useState, useEffect } from 'react'
import { Layout, notification } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { LoginSelector, AuthLogin } from '@/components/auth/LoginComponents'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { CareWorkerDashboard } from '@/components/dashboard/CareWorkerDashboard'

const { Content } = Layout

type AppState = 'role-selection' | 'auth-login' | 'dashboard'
type UserRole = 'MANAGER' | 'CARE_WORKER'

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('role-selection')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Check if user is returning from Auth0 callback
  useEffect(() => {
    // In real implementation, this would check Auth0 session
    // For demo, we'll check URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    
    if (code && state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state))
        if (stateData.role) {
          setSelectedRole(stateData.role)
          setIsLoggedIn(true)
          setAppState('dashboard')
          notification.success({
            message: 'Login Successful',
            description: `Welcome to Healthcare Clock App as ${stateData.role.toLowerCase().replace('_', ' ')}!`,
          })
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch (error) {
        console.error('Error parsing state:', error)
      }
    }
  }, [])

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setAppState('auth-login')
  }

  const handleBackToRoleSelection = () => {
    setAppState('role-selection')
    setSelectedRole(null)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setSelectedRole(null)
    setAppState('role-selection')
    notification.info({
      message: 'Logged Out',
      description: 'You have been logged out successfully.',
    })
  }

  // Mock login for demo purposes (bypass Auth0 for testing)
  const handleMockLogin = (role: UserRole) => {
    setSelectedRole(role)
    setIsLoggedIn(true)
    setAppState('dashboard')
    notification.success({
      message: 'Demo Login Successful',
      description: `Welcome to Healthcare Clock App as ${role.toLowerCase().replace('_', ' ')}!`,
    })
  }

  if (appState === 'dashboard' && isLoggedIn && selectedRole) {
    if (selectedRole === 'MANAGER') {
      return <ManagerDashboard onLogout={handleLogout} />
    } else {
      return <CareWorkerDashboard onLogout={handleLogout} userRole="CARE_WORKER" />
    }
  }

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    }}>
      <Content style={{ 
        padding: '50px 24px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 40,
          color: 'white'
        }}>
          <ClockCircleOutlined style={{ fontSize: 64, marginBottom: 16 }} />
          <h1 style={{ 
            fontSize: 48, 
            fontWeight: 'bold', 
            margin: 0,
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Healthcare Clock App
          </h1>
          <p style={{ 
            fontSize: 18, 
            margin: 0, 
            opacity: 0.9,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Professional time tracking for healthcare workers
          </p>
        </div>

        {appState === 'role-selection' && (
          <div style={{ width: '100%', maxWidth: 500 }}>
            <LoginSelector onRoleSelect={handleRoleSelect} />
            
            {/* Demo Login Buttons */}
            <div style={{ 
              marginTop: 20, 
              textAlign: 'center',
              padding: 16,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ color: 'white', margin: '0 0 12px 0', fontSize: 14 }}>
                Demo Mode (Skip Auth0):
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={() => handleMockLogin('CARE_WORKER')}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 4,
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Demo as Care Worker
                </button>
                <button
                  onClick={() => handleMockLogin('MANAGER')}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: 4,
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Demo as Manager
                </button>
              </div>
            </div>
          </div>
        )}

        {appState === 'auth-login' && selectedRole && (
          <AuthLogin 
            role={selectedRole} 
            onBack={handleBackToRoleSelection}
          />
        )}
      </Content>
    </Layout>
  )
}
