/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { 
  Card, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Divider,
  Radio,
  RadioChangeEvent
} from 'antd'
import { 
  UserOutlined, 
  TeamOutlined, 
  GoogleOutlined,
  MailOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

interface LoginSelectorProps {
  onRoleSelect: (role: 'MANAGER' | 'CARE_WORKER') => void
  onBack?: () => void
}

export function LoginSelector({ onRoleSelect, onBack }: LoginSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<'MANAGER' | 'CARE_WORKER'>('CARE_WORKER')

  const handleRoleChange = (e: RadioChangeEvent) => {
    setSelectedRole(e.target.value)
  }

  const handleContinue = () => {
    onRoleSelect(selectedRole)
  }

  return (
    <Card 
      style={{ 
        width: '100%', 
        maxWidth: 500, 
        margin: '0 auto',
        borderRadius: 16, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
        {onBack && (
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            style={{ alignSelf: 'flex-start' }}
          >
            Back
          </Button>
        )}
        
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>Choose Your Role</Title>
          <Text type="secondary">
            Select your role to access the appropriate features
          </Text>
        </div>

        <Radio.Group 
          value={selectedRole} 
          onChange={handleRoleChange}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card 
              hoverable
              className={selectedRole === 'CARE_WORKER' ? 'selected-role' : ''}
              style={{ 
                border: selectedRole === 'CARE_WORKER' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedRole('CARE_WORKER')}
            >
              <Radio value="CARE_WORKER" style={{ display: 'none' }} />
              <Space>
                <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                <div style={{ textAlign: 'left' }}>
                  <Title level={4} style={{ margin: 0 }}>Care Worker</Title>
                  <Text type="secondary">Clock in/out, track shifts</Text>
                </div>
              </Space>
            </Card>

            <Card 
              hoverable
              className={selectedRole === 'MANAGER' ? 'selected-role' : ''}
              style={{ 
                border: selectedRole === 'MANAGER' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedRole('MANAGER')}
            >
              <Radio value="MANAGER" style={{ display: 'none' }} />
              <Space>
                <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                <div style={{ textAlign: 'left' }}>
                  <Title level={4} style={{ margin: 0 }}>Manager</Title>
                  <Text type="secondary">Dashboard, analytics, staff management</Text>
                </div>
              </Space>
            </Card>
          </Space>
        </Radio.Group>

        <Button 
          type="primary" 
          size="large" 
          onClick={handleContinue}
          style={{ width: '100%', height: 48 }}
        >
          Continue as {selectedRole === 'MANAGER' ? 'Manager' : 'Care Worker'}
        </Button>
      </Space>

      <style jsx global>{`
        .selected-role {
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2) !important;
        }
      `}</style>
    </Card>
  )
}

interface AuthLoginProps {
  role: 'MANAGER' | 'CARE_WORKER'
  onBack: () => void
}

export function AuthLogin({ role, onBack }: AuthLoginProps) {
  const handleAuth0Login = (provider?: string) => {
    // Store role in localStorage as backup
    localStorage.setItem('pendingUserRole', role)
    
    // Create the login URL with role in state and connection
    let loginUrl = '/api/auth/login'
    const params = new URLSearchParams()
    
    if (provider === 'google') {
      params.append('connection', 'google-oauth2')
    }
    
    // Add role as state parameter - simple string encoding
    const stateData = JSON.stringify({ role })
    params.append('state', stateData)
    
    if (params.toString()) {
      loginUrl += '?' + params.toString()
    }
    
    console.log('Redirecting to:', loginUrl)
    window.location.href = loginUrl
  }

  const getRoleIcon = () => {
    return role === 'MANAGER' ? (
      <TeamOutlined style={{ fontSize: 48, color: '#52c41a' }} />
    ) : (
      <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />
    )
  }

  const getRoleColor = () => {
    return role === 'MANAGER' ? '#52c41a' : '#1890ff'
  }

  return (
    <Card 
      style={{ 
        width: '100%', 
        maxWidth: 500, 
        margin: '0 auto',
        borderRadius: 16, 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
        >
          Back to Role Selection
        </Button>

        <div style={{ textAlign: 'center' }}>
          {getRoleIcon()}
          <Title level={2} style={{ marginTop: 16, marginBottom: 8 }}>
            {role === 'MANAGER' ? 'Manager Login' : 'Care Worker Login'}
          </Title>
          <Text type="secondary">
            {role === 'MANAGER' 
              ? 'Access dashboard, analytics, and staff management' 
              : 'Clock in/out and track your shifts'
            }
          </Text>
        </div>

        <Divider>Choose Login Method</Divider>

        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Button 
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={() => handleAuth0Login('google')}
            style={{ 
              width: '100%', 
              height: 48,
              background: getRoleColor()
            }}
          >
            Continue with Google
          </Button>

          <Button 
            size="large"
            icon={<MailOutlined />}
            onClick={() => handleAuth0Login()}
            style={{ 
              width: '100%', 
              height: 48,
              borderColor: getRoleColor(),
              color: getRoleColor()
            }}
          >
            Continue with Email
          </Button>
        </Space>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Secure authentication powered by Auth0
          </Text>
        </div>
      </Space>
    </Card>
  )
}
