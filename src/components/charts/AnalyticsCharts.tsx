/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useRef } from 'react'
import { Card, Typography } from 'antd'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

const { Title: AntTitle } = Typography

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

interface DailyClockInsChartProps {
  data: {
    date: string
    clockIns: number
  }[]
}

export function DailyClockInsChart({ data }: DailyClockInsChartProps) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Daily Clock-ins',
        data: data.map(item => item.clockIns),
        backgroundColor: 'rgba(24, 144, 255, 0.6)',
        borderColor: 'rgba(24, 144, 255, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <Card title="Daily Clock-ins" style={{ height: 300 }}>
      <div style={{ height: 200 }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  )
}

interface AverageHoursChartProps {
  data: {
    date: string
    avgHours: number
  }[]
}

export function AverageHoursChart({ data }: AverageHoursChartProps) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Average Hours',
        data: data.map(item => item.avgHours),
        borderColor: 'rgba(82, 196, 26, 1)',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(82, 196, 26, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 12,
        ticks: {
          stepSize: 2,
          callback: function(value: any) {
            return value + 'h'
          }
        },
      },
    },
  }

  return (
    <Card title="Average Hours Worked" style={{ height: 300 }}>
      <div style={{ height: 200 }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  )
}

interface StaffStatusChartProps {
  data: {
    clockedIn: number
    clockedOut: number
    onBreak: number
  }
}

export function StaffStatusChart({ data }: StaffStatusChartProps) {
  const chartData = {
    labels: ['Clocked In', 'Clocked Out', 'On Break'],
    datasets: [
      {
        data: [data.clockedIn, data.clockedOut, data.onBreak],
        backgroundColor: [
          'rgba(82, 196, 26, 0.8)',
          'rgba(255, 77, 79, 0.8)',
          'rgba(250, 173, 20, 0.8)',
        ],
        borderColor: [
          'rgba(82, 196, 26, 1)',
          'rgba(255, 77, 79, 1)',
          'rgba(250, 173, 20, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: false,
      },
    },
  }

  return (
    <Card title="Current Staff Status" style={{ height: 300 }}>
      <div style={{ height: 200 }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </Card>
  )
}

interface WeeklyHoursChartProps {
  data: {
    name: string
    hours: number
    role: string
  }[]
}

export function WeeklyHoursChart({ data }: WeeklyHoursChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Hours This Week',
        data: data.map(item => item.hours),
        backgroundColor: data.map(item => 
          item.role === 'MANAGER' ? 'rgba(114, 46, 209, 0.6)' : 'rgba(24, 144, 255, 0.6)'
        ),
        borderColor: data.map(item => 
          item.role === 'MANAGER' ? 'rgba(114, 46, 209, 1)' : 'rgba(24, 144, 255, 1)'
        ),
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 60,
        ticks: {
          callback: function(value: any) {
            return value + 'h'
          }
        },
      },
    },
  }

  return (
    <Card title="Weekly Hours by Staff" style={{ height: 400 }}>
      <div style={{ height: 300 }}>
        <Bar data={chartData} options={options} />
      </div>
    </Card>
  )
}
