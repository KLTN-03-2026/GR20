import React from 'react'
import HeaderMainUser from 'src/components/HeaderMainUser/HeaderMainUser'

import SidebarStaff from 'src/components/sidebarStaff/SidebarStaff'

interface Props {
  children?: React.ReactNode
}

export default function DashboaedLayoutStaff({ children }: Props) {
  return (
    <div className='bg-surface text-on-surface min-h-screen flex'>
      <SidebarStaff />
      <div className='flex-1 lg:ml-64 w-full'>
        <HeaderMainUser />
        <main className='px-6 py-4 max-w-screen-2xl mx-auto'>{children}</main>
      </div>
    </div>
  )
}
