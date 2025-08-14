/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { ConfigProvider } from 'antd'
import { theme } from 'antd'

const { defaultAlgorithm, darkAlgorithm } = theme

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          colorBgContainer: '#ffffff',
        },
        components: {
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: 12,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}
