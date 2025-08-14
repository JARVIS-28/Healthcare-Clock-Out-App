'use client'

import { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Badge,
  Modal,
  Form,
  Input,
  Table,
  Tag,
  Timeline,
  Statistic,
} from 'antd'
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  LogoutOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { TextArea } = Input

interface ClockEntry {
  id: string
  status: 'CLOCKED_IN' | 'CLOCKED_OUT'
  timestamp: string
  location: string
  note?: string
}

interface CareWorkerDashboardProps {
  onLogout: () => void
  userRole: 'CARE_WORKER'
}

export function CareWorkerDashboard({ onLogout }: CareWorkerDashboardProps) {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [isWithinPerimeter, setIsWithinPerimeter] = useState<boolean | null>(null)
  const [isClockModalVisible, setIsClockModalVisible] = useState(false)
  const [clockAction, setClockAction] = useState<'in' | 'out'>('in')
  const [clockNote, setClockNote] = useState('')

  // Mock data - in real app this would come from GraphQL
  const [clockHistory] = useState<ClockEntry[]>([
    {
      id: '1',
      status: 'CLOCKED_IN',
      timestamp: '2025-08-14T08:30:00Z',
      location: 'Emergency Ward Entrance',
      note: 'Starting morning shift',
    },
    {
      id: '2',
      status: 'CLOCKED_OUT',
      timestamp: '2025-08-13T17:00:00Z',
      location: 'Emergency Ward Exit',
      note: 'End of shift - handed over to night team',
    },
    {
      id: '3',
      status: 'CLOCKED_IN',
      timestamp: '2025-08-13T08:30:00Z',
      location: 'Emergency Ward Entrance',
    },
    {
      id: '4',
      status: 'CLOCKED_OUT',
      timestamp: '2025-08-12T17:15:00Z',
      location: 'Emergency Ward Exit',
      note: 'Overtime - covered for Sarah',
    },
  ])

  const [weeklyStats] = useState({
    totalHours: 42.5,
    daysWorked: 5,
    avgHoursPerDay: 8.5,
    shiftsCompleted: 5,
  })

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return
    }

    setIsLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setCurrentLocation(location)
        checkPerimeter(location)
        setIsLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        setIsLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }

  const checkPerimeter = (location: { latitude: number; longitude: number }) => {
    // Mock perimeter check - in real app this would call GraphQL
    const hospitalLat = 37.7749
    const hospitalLng = -122.4194
    const radius = 2.0

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      hospitalLat,
      hospitalLng
    )

    setIsWithinPerimeter(distance <= radius)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleClockAction = (action: 'in' | 'out') => {
    if (!currentLocation) {
      getCurrentLocation()
      return
    }

    if (!isWithinPerimeter) {
      Modal.warning({
        title: 'Outside Perimeter',
        content: 'You are outside the allowed area. Please move closer to the hospital to clock in/out.',
      })
      return
    }

    setClockAction(action)
    setIsClockModalVisible(true)
  }

  const confirmClockAction = () => {
    // Mock clock action - in real app this would call GraphQL mutation
    setIsClockedIn(clockAction === 'in')
    setIsClockModalVisible(false)
    setClockNote('')

    Modal.success({
      title: `Successfully ${clockAction === 'in' ? 'Clocked In' : 'Clocked Out'}`,
      content: `You have been ${clockAction === 'in' ? 'clocked in' : 'clocked out'} at ${new Date().toLocaleTimeString()}`,
    })
  }

  const historyColumns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'CLOCKED_IN' ? 'green' : 'red'}>
          {status === 'CLOCKED_IN' ? 'Clock In' : 'Clock Out'}
        </Tag>
      ),
    },
    {
      title: 'Date & Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => {
        const date = new Date(timestamp)
        return (
          <div>
            <div>{date.toLocaleDateString()}</div>
            <Text type="secondary">{date.toLocaleTimeString()}</Text>
          </div>
        )
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => note || '-',
    },
  ]

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px'
      }}>
        <Space>
          <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>Care Worker Portal</Title>
        </Space>
        <Space>
          <Badge status={isClockedIn ? 'processing' : 'default'} />
          <Text>{isClockedIn ? 'Clocked In' : 'Clocked Out'}</Text>
          <Button icon={<LogoutOutlined />} onClick={onLogout}>
            Logout
          </Button>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Row gutter={[24, 24]}>
          {/* Weekly Stats */}
          <Col span={24}>
            <Card title="This Week's Summary">
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Hours"
                    value={weeklyStats.totalHours}
                    suffix="h"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Days Worked"
                    value={weeklyStats.daysWorked}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Avg Hours/Day"
                    value={weeklyStats.avgHoursPerDay}
                    suffix="h"
                    precision={1}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Shifts Completed"
                    value={weeklyStats.shiftsCompleted}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Location & Clock In/Out */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <EnvironmentOutlined />
                  Location Status
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                {currentLocation ? (
                  <>
                    <div>
                      <Text strong>Current Location:</Text>
                      <br />
                      <Text>Lat: {currentLocation.latitude.toFixed(6)}</Text>
                      <br />
                      <Text>Lng: {currentLocation.longitude.toFixed(6)}</Text>
                    </div>
                    <Badge 
                      status={isWithinPerimeter ? 'success' : 'error'} 
                      text={isWithinPerimeter ? 'Within hospital perimeter' : 'Outside perimeter'} 
                    />
                  </>
                ) : (
                  <Text type="secondary">Location not detected</Text>
                )}
                <Button 
                  icon={<EnvironmentOutlined />}
                  loading={isLocationLoading}
                  onClick={getCurrentLocation}
                >
                  {isLocationLoading ? 'Getting Location...' : 'Update Location'}
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Clock In/Out Actions */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <ClockCircleOutlined />
                  Time Tracking
                </Space>
              }
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} type={isClockedIn ? 'success' : 'secondary'}>
                    {isClockedIn ? 'Currently Clocked In' : 'Currently Clocked Out'}
                  </Title>
                  <Text type="secondary">
                    {new Date().toLocaleString()}
                  </Text>
                </div>
                
                <Space style={{ width: '100%' }} direction="vertical">
                  <Button 
                    type="primary"
                    size="large"
                    icon={<ClockCircleOutlined />}
                    onClick={() => handleClockAction('in')}
                    disabled={isClockedIn || !currentLocation}
                    style={{ 
                      width: '100%', 
                      height: 48,
                      background: '#52c41a'
                    }}
                  >
                    Clock In
                  </Button>
                  
                  <Button 
                    type="primary"
                    size="large"
                    icon={<ClockCircleOutlined />}
                    onClick={() => handleClockAction('out')}
                    disabled={!isClockedIn || !currentLocation}
                    style={{ 
                      width: '100%', 
                      height: 48,
                      background: '#ff4d4f'
                    }}
                  >
                    Clock Out
                  </Button>
                </Space>

                {!currentLocation && (
                  <Text type="warning" style={{ textAlign: 'center', display: 'block' }}>
                    Location required to clock in/out
                  </Text>
                )}
                {!isWithinPerimeter && currentLocation && (
                  <Text type="danger" style={{ textAlign: 'center', display: 'block' }}>
                    You are outside the hospital perimeter
                  </Text>
                )}
              </Space>
            </Card>
          </Col>

          {/* Recent Activity */}
          <Col xs={24} lg={12}>
            <Card title="Recent Activity">
              <Timeline
                items={clockHistory.slice(0, 4).map(entry => ({
                  dot: entry.status === 'CLOCKED_IN' ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  ),
                  children: (
                    <div>
                      <Text strong>
                        {entry.status === 'CLOCKED_IN' ? 'Clocked In' : 'Clocked Out'}
                      </Text>
                      <br />
                      <Text type="secondary">
                        {new Date(entry.timestamp).toLocaleString()}
                      </Text>
                      <br />
                      <Text type="secondary">{entry.location}</Text>
                      {entry.note && (
                        <>
                          <br />
                          <Text italic>"{entry.note}"</Text>
                        </>
                      )}
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>

          {/* Clock History Table */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <HistoryOutlined />
                  Clock History
                </Space>
              }
            >
              <Table
                columns={historyColumns}
                dataSource={clockHistory}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                size="small"
                scroll={{ x: 400 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Clock Action Modal */}
        <Modal
          title={`${clockAction === 'in' ? 'Clock In' : 'Clock Out'}`}
          open={isClockModalVisible}
          onOk={confirmClockAction}
          onCancel={() => setIsClockModalVisible(false)}
          okText={`${clockAction === 'in' ? 'Clock In' : 'Clock Out'}`}
        >
          <Form layout="vertical">
            <Form.Item label="Location">
              <Text>
                {currentLocation 
                  ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                  : 'Unknown'
                }
              </Text>
            </Form.Item>
            <Form.Item label="Note (Optional)">
              <TextArea
                value={clockNote}
                onChange={(e) => setClockNote(e.target.value)}
                placeholder={`Add a note for your ${clockAction === 'in' ? 'clock in' : 'clock out'}...`}
                rows={3}
                maxLength={200}
              />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}
