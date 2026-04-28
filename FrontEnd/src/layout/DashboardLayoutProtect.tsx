import React, { useState } from 'react'
import HeaderProtect from 'src/components/HeaderProtect/HeaderProtect'
import SidebarProtect from 'src/components/SidebarProtect.tsx/SidebarProtect'

interface Props {
  children?: React.ReactNode
}

export default function DashboardLayoutProtect({ children }: Props) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const sidebarWidthClass = isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
  return (
    <div className='bg-surface text-on-surface min-h-screen flex'>
      <SidebarProtect collapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed((v) => !v)} />
      <div className={`flex-1 w-full ${sidebarWidthClass}`}>
        <HeaderProtect />
        <main className='mt-20 px-6 py-4 max-w-screen-2xl mx-auto'>{children}</main>
      </div>
    </div>
  )
}
