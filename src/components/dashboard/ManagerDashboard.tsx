'use client'

import { useState, useEffect } from 'react'
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  InputNumber,
  message,
  Tabs,
  Badge,
  Avatar,
  List,
  Timeline,
} from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
  DailyClockInsChart,
  AverageHoursChart,
  StaffStatusChart,
  WeeklyHoursChart,
} from '../charts/AnalyticsCharts'

const { Content } = Layout
const { Title, Text } = Typography
const { TabPane } = Tabs

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  status: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK'
  lastClockIn?: string
  lastClockOut?: string
  location?: string
  todayHours: number
  weeklyHours: number
}

interface ManagerDashboardProps {
  onLogout: () => void
}

export function ManagerDashboard({ onLogout }: ManagerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isPerimeterModalVisible, setIsPerimeterModalVisible] = useState(false)
  const [perimeterSettings, setPerimeterSettings] = useState({
    centerLat: 37.7749,
    centerLng: -122.4194,
    radius: 2.0,
  })

  // Mock data - in real app this would come from GraphQL
  const [staffData] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@hospital.com',
      role: 'CARE_WORKER',
      status: 'CLOCKED_IN',
      lastClockIn: '2025-08-14T08:30:00Z',
      location: 'Emergency Ward',
      todayHours: 6.5,
      weeklyHours: 42,
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@hospital.com',
      role: 'CARE_WORKER',
      status: 'CLOCKED_OUT',
      lastClockOut: '2025-08-14T17:00:00Z',
      location: 'ICU',
      todayHours: 8,
      weeklyHours: 40,
    },
    {
      id: '3',
      name: 'Carol Wilson',
      email: 'carol@hospital.com',
      role: 'CARE_WORKER',
      status: 'CLOCKED_IN',
      lastClockIn: '2025-08-14T07:00:00Z',
      location: 'General Ward',
      todayHours: 7.5,
      weeklyHours: 38,
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david@hospital.com',
      role: 'CARE_WORKER',
      status: 'ON_BREAK',
      lastClockIn: '2025-08-14T09:00:00Z',
      location: 'Pediatrics',
      todayHours: 5,
      weeklyHours: 35,
    },
  ])

  const [analyticsData] = useState({
    dailyClockIns: [
      { date: '2025-08-08', clockIns: 15 },
      { date: '2025-08-09', clockIns: 18 },
      { date: '2025-08-10', clockIns: 12 },
      { date: '2025-08-11', clockIns: 16 },
      { date: '2025-08-12', clockIns: 20 },
      { date: '2025-08-13', clockIns: 14 },
      { date: '2025-08-14', clockIns: 17 },
    ],
    averageHours: [
      { date: '2025-08-08', avgHours: 8.2 },
      { date: '2025-08-09', avgHours: 7.8 },
      { date: '2025-08-10', avgHours: 8.5 },
      { date: '2025-08-11', avgHours: 8.1 },
      { date: '2025-08-12', avgHours: 7.9 },
      { date: '2025-08-13', avgHours: 8.3 },
      { date: '2025-08-14', avgHours: 8.0 },
    ],
    staffStatus: {
      clockedIn: 2,
      clockedOut: 1,
      onBreak: 1,
    },
    weeklyHours: staffData.map(staff => ({
      name: staff.name,
      hours: staff.weeklyHours,
      role: staff.role,
    })),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return 'green'
      case 'CLOCKED_OUT':
        return 'red'
      case 'ON_BREAK':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return 'Clocked In'
      case 'CLOCKED_OUT':
        return 'Clocked Out'
      case 'ON_BREAK':
        return 'On Break'
      default:
        return 'Unknown'
    }
  }

  const handlePerimeterUpdate = (values: any) => {
    setPerimeterSettings(values)
    setIsPerimeterModalVisible(false)
    message.success('Perimeter settings updated successfully!')
  }

  const staffColumns = [
    {
      title: 'Staff Member',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: StaffMember) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Last Clock In',
      dataIndex: 'lastClockIn',
      key: 'lastClockIn',
      render: (time: string) =>
        time ? new Date(time).toLocaleTimeString() : '-',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => location || '-',
    },
    {
      title: 'Today Hours',
      dataIndex: 'todayHours',
      key: 'todayHours',
      render: (hours: number) => `${hours}h`,
    },
    {
      title: 'Weekly Hours',
      dataIndex: 'weeklyHours',
      key: 'weeklyHours',
      render: (hours: number) => `${hours}h`,
    },
  ]

  const recentActivity = [
    {
      id: '1',
      user: 'Alice Johnson',
      action: 'Clocked In',
      time: '2 minutes ago',
      location: 'Emergency Ward',
      type: 'clock-in',
    },
    {
      id: '2',
      user: 'Carol Wilson',
      action: 'Clocked Out',
      time: '15 minutes ago',
      location: 'General Ward',
      type: 'clock-out',
    },
    {
      id: '3',
      user: 'David Brown',
      action: 'Started Break',
      time: '1 hour ago',
      location: 'Pediatrics',
      type: 'break',
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0 }}>
                <DashboardOutlined /> Manager Dashboard
              </Title>
              <Text type="secondary">
                Monitor staff, manage settings, and view analytics
              </Text>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => setIsPerimeterModalVisible(true)}
                >
                  Perimeter Settings
                </Button>
                <Button onClick={onLogout}>Logout</Button>
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <DashboardOutlined />
                Overview
              </span>
            }
            key="overview"
          >
            {/* Key Metrics */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Staff Clocked In"
                    value={analyticsData.staffStatus.clockedIn}
                    prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Today's Clock-ins"
                    value={17}
                    prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Avg Hours/Day"
                    value={8.0}
                    precision={1}
                    suffix="h"
                    prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Total Week Hours"
                    value={155}
                    suffix="h"
                    prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Charts */}
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <DailyClockInsChart data={analyticsData.dailyClockIns} />
              </Col>
              <Col xs={24} lg={12}>
                <AverageHoursChart data={analyticsData.averageHours} />
              </Col>
            </Row>

            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <StaffStatusChart data={analyticsData.staffStatus} />
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Recent Activity">
                  <Timeline
                    items={recentActivity.map(activity => ({
                      dot: activity.type === 'clock-in' ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                      ),
                      children: (
                        <div>
                          <Text strong>{activity.user}</Text> {activity.action}
                          <br />
                          <Text type="secondary">{activity.location} • {activity.time}</Text>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <TeamOutlined />
                Staff Management
              </span>
            }
            key="staff"
          >
            <Card title="Current Staff Status" style={{ marginBottom: 24 }}>
              <Table
                columns={staffColumns}
                dataSource={staffData}
                rowKey="id"
                pagination={false}
                scroll={{ x: 800 }}
              />
            </Card>

            <WeeklyHoursChart data={analyticsData.weeklyHours} />
          </TabPane>

          <TabPane
            tab={
              <span>
                <EnvironmentOutlined />
                Location Settings
              </span>
            }
            key="location"
          >
            <Card title="Current Perimeter Settings">
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text strong>Center Latitude:</Text>
                      <br />
                      <Text>{perimeterSettings.centerLat}</Text>
                    </div>
                    <div>
                      <Text strong>Center Longitude:</Text>
                      <br />
                      <Text>{perimeterSettings.centerLng}</Text>
                    </div>
                    <div>
                      <Text strong>Radius:</Text>
                      <br />
                      <Text>{perimeterSettings.radius} km</Text>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={12}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => setIsPerimeterModalVisible(true)}
                  >
                    Update Perimeter Settings
                  </Button>
                </Col>
              </Row>
            </Card>
          </TabPane>
        </Tabs>

        {/* Perimeter Settings Modal */}
        <Modal
          title="Update Perimeter Settings"
          open={isPerimeterModalVisible}
          onCancel={() => setIsPerimeterModalVisible(false)}
          footer={null}
        >
          <Form
            layout="vertical"
            initialValues={perimeterSettings}
            onFinish={handlePerimeterUpdate}
          >
            <Form.Item
              label="Center Latitude"
              name="centerLat"
              rules={[{ required: true, message: 'Please enter latitude' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. 37.7749"
                step={0.000001}
                precision={6}
              />
            </Form.Item>
            <Form.Item
              label="Center Longitude"
              name="centerLng"
              rules={[{ required: true, message: 'Please enter longitude' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. -122.4194"
                step={0.000001}
                precision={6}
              />
            </Form.Item>
            <Form.Item
              label="Radius (km)"
              name="radius"
              rules={[{ required: true, message: 'Please enter radius' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="e.g. 2.0"
                min={0.1}
                max={10}
                step={0.1}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update Settings
                </Button>
                <Button onClick={() => setIsPerimeterModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  )
}
