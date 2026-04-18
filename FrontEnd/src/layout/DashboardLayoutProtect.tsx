import React from 'react'
import HeaderProtect from 'src/components/HeaderProtect/HeaderProtect'
import SidebarProtect from 'src/components/SidebarProtect.tsx/SidebarProtect'

interface Props {
  children?: React.ReactNode
}

export default function DashboardLayoutProtect({ children }: Props) {
  return (
    <div className='bg-surface text-on-surface min-h-screen flex'>
      <SidebarProtect />
      <div className='flex-1 lg:ml-64 w-full'>
        <HeaderProtect />
        <main className='mt-20 px-6 py-4 max-w-screen-2xl mx-auto'>{children}</main>
      </div>
    </div>
  )
}
