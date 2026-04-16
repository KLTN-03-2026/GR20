import React from 'react'
import { Link } from 'react-router-dom'

export default function HeaderMainUser() {
  return (
    <header className='w-full top-0 sticky z-40 bg-surface/80 backdrop-blur-md'>
      <div className='flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-bold font-manrope tracking-tight text-primary'>Chào mừng, Nguyễn Văn A</h2>
          <p className='text-xs text-on-surface-variant font-medium'>Căn hộ PB23-1505 • Diamond Precinct</p>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='hidden md:flex items-center gap-2 bg-[#f2f4f6] px-4 py-1.5 rounded-full'>
            <span className='material-symbols-outlined text-sm text-[#717786]'>search</span>
            <input
              className='bg-transparent border-none text-sm focus:ring-0 p-0 w-35 outline-none'
              placeholder='Tìm kiếm...'
              type='text'
            />
          </div>

          <button className='w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-container/20 transition-colors relative'>
            <span className='material-symbols-outlined text-slate-600'>notifications</span>
            <span className='absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface'></span>
          </button>

          <button className='w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary-container/20 transition-colors relative'>
            <span className='material-symbols-outlined text-slate-600'>settings</span>
            <span className='absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface'></span>
          </button>
          <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-secondary-container/30'>
            <Link to={'/profile'}>
              <img
                alt='Profile'
                src='https://lh3.googleusercontent.com/aida-public/AB6AXuDL1eBpoohaiJBVxfjTjwwdQDGSv2ArCBoTjnMsaI2FxRcDXSJKBklw2m_3MYLF26uvXdCBc6Uow-5akOQ_yFhz_hIvJA_oxjLZjNOALTIxRNHr1cPf9uAJtnb32GMIjnNL5oJ0_mEIyaNJi8BrJABeRvpXJT__b9erCOYoQnzEdjflCM1cSWRKDh4HVC2rG-QlQgjGtwsaAed38NaMOgQIE1bSwwF2B_1ICagsr20HXSAfLH6Q7RX2QPPtDEV-qkolgP9MxzfFHJQs'
              />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
