'use client'

import { useEffect, useState } from 'react'
import { Card, Button, Space, Typography, Alert } from 'antd'
import { useUser } from '@auth0/nextjs-auth0/client'

const { Title, Text } = Typography

export default function TestLoginPage() {
  const { user, error, isLoading } = useUser()
  const [authState, setAuthState] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Test the auth endpoint
    fetch('/api/test-auth')
      .then(res => res.json())
      .then(data => {
        console.log('Auth test response:', data)
        setAuthState(data)
      })
      .catch(err => {
        console.error('Auth test error:', err)
        setAuthState({ error: err.message })
      })
  }, [mounted])

  const handleTestLogin = (role: 'MANAGER' | 'CARE_WORKER', provider?: string) => {
    if (!mounted) return
    
    // Store role for testing
    localStorage.setItem('pendingUserRole', role)
    
    // Create login URL
    let loginUrl = '/api/auth/login'
    const params = new URLSearchParams()
    
    if (provider === 'google') {
      params.append('connection', 'google-oauth2')
    }
    
    // Add role as state
    const stateData = JSON.stringify({ role })
    params.append('state', encodeURIComponent(stateData))
    
    if (params.toString()) {
      loginUrl += '?' + params.toString()
    }
    
    console.log('🔗 Login URL:', loginUrl)
    console.log('📊 State data:', stateData)
    
    window.location.href = loginUrl
  }

  const handleLogout = () => {
    if (!mounted) return
    window.location.href = '/api/auth/logout'
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🧪 Auth0 Test Page</Title>
      
      {/* User Status */}
      <Card title="👤 User Status" style={{ marginBottom: '20px' }}>
        {isLoading && <Text>Loading...</Text>}
        {error && <Alert type="error" message={error.message} />}
        {user ? (
          <div>
            <Text strong>✅ Authenticated!</Text>
            <br />
            <Text>Email: {user.email}</Text>
            <br />
            <Text>Name: {user.name}</Text>
            <br />
            <Text>Role: {(user as any).role || 'Not set'}</Text>
            <br />
            <Button onClick={handleLogout} style={{ marginTop: '10px' }}>
              Logout
            </Button>
          </div>
        ) : (
          <Text>❌ Not authenticated</Text>
        )}
      </Card>

      {/* Auth Test Results */}
      <Card title="🔍 Auth Test Results" style={{ marginBottom: '20px' }}>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(authState, null, 2)}
        </pre>
      </Card>

      {/* Test Login Buttons */}
      <Card title="🚀 Test Login" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Email/Password Login:</Text>
          <Space>
            <Button 
              type="primary" 
              onClick={() => handleTestLogin('MANAGER')}
            >
              Login as Manager
            </Button>
            <Button 
              onClick={() => handleTestLogin('CARE_WORKER')}
            >
              Login as Care Worker
            </Button>
          </Space>
          
          <Text strong>Google Login:</Text>
          <Space>
            <Button 
              type="primary" 
              onClick={() => handleTestLogin('MANAGER', 'google')}
            >
              Google Login as Manager
            </Button>
            <Button 
              onClick={() => handleTestLogin('CARE_WORKER', 'google')}
            >
              Google Login as Care Worker
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Environment Info */}
      <Card title="🔧 Environment Info">
        <Text>Base URL: {typeof window !== 'undefined' ? window.location.origin : 'Server'}</Text>
        <br />
        <Text>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server'}</Text>
        <br />
        <Text>Local Storage Role: {typeof window !== 'undefined' ? localStorage.getItem('pendingUserRole') || 'Not set' : 'Server'}</Text>
      </Card>
    </div>
  )
}
