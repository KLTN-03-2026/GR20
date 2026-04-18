import React from 'react'

export default function HeaderProtect() {
  return (
    <header className='fixed top-0 right-0 left-0 lg:left-64 bg-slate-50/70 backdrop-blur-xl z-40 shadow-sm'>
      <div className='flex justify-end items-center w-full px-6 py-4 max-w-screen-2xl mx-auto'>
        <div className='flex items-center space-x-4'>
          <div className='relative group'>
            <span className='absolute inset-y-0 left-3 flex items-center text-slate-400'>
              <span className='material-symbols-outlined text-sm'>search</span>
            </span>
            <input
              className='pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all'
              placeholder='Search residents or plates...'
              type='text'
            />
          </div>
          <button className='p-2 text-slate-500 hover:text-blue-500 transition-colors'>
            <span className='material-symbols-outlined'>notifications</span>
          </button>
          <button className='p-2 text-slate-500 hover:text-blue-500 transition-colors'>
            <span className='material-symbols-outlined'>account_circle</span>
          </button>
        </div>
      </div>
    </header>
  )
}
