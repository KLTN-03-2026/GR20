import React from 'react'
import HeaderProtect from 'src/components/HeaderProtect/HeaderProtect'
import SidebarProtect from 'src/components/SidebarProtect.tsx/SidebarProtect'

export default function HomePageProtect() {
  return (
    <div className='bg-surface text-on-surface'>
      <div className='flex min-h-screen'>
        {/* SideNavBar */}
        <SidebarProtect />

        {/* Main Content Area */}
        <main className='flex-1  bg-surface min-h-screen '>
          {/* TopNavBar */}
          <HeaderProtect />

          <div className='px-8 max-w-screen-2xl mx-auto'>
            {/* Welcome Section */}
            <div className='mb-10'>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-primary mb-1'>Morning, Officer Miller</p>
              <h2 className='text-3xl font-extrabold tracking-tight text-on-surface'>Security Overview</h2>
            </div>

            {/* Metrics Bento Grid */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
              <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='p-2 bg-primary-fixed rounded-lg text-on-primary-fixed'>
                    <span className='material-symbols-outlined'>qr_code_scanner</span>
                  </div>
                  <span className='text-xs font-bold text-on-surface-variant'>+12% from yesterday</span>
                </div>
                <p className='text-3xl font-extrabold text-on-surface'>1,284</p>
                <p className='text-sm font-medium text-on-surface-variant'>Total Scans Today</p>
              </div>
              <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='p-2 bg-secondary-fixed rounded-lg text-on-secondary-fixed'>
                    <span className='material-symbols-outlined'>group</span>
                  </div>
                  <span className='text-xs font-bold text-on-surface-variant'>Currently on-site</span>
                </div>
                <p className='text-3xl font-extrabold text-on-surface'>12</p>
                <p className='text-sm font-medium text-on-surface-variant'>Active Guests</p>
              </div>
              <div className='bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='p-2 bg-error-container rounded-lg text-on-error-container'>
                    <span className='material-symbols-outlined'>flag</span>
                  </div>
                  <span className='text-xs font-bold text-error'>Requires attention</span>
                </div>
                <p className='text-3xl font-extrabold text-on-surface'>2</p>
                <p className='text-sm font-medium text-on-surface-variant'>Flagged Incidents</p>
              </div>
            </div>

            {/* Quick Actions & Logistics Layout */}
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
              {/* Left: Quick Actions */}
              <div className='lg:col-span-4 space-y-6'>
                <h3 className='text-sm font-bold uppercase tracking-widest text-on-surface-variant px-1'>
                  Quick Actions
                </h3>
                <button className='w-full group relative overflow-hidden bg-gradient-to-br from-primary to-primary-container p-8 rounded-2xl text-left shadow-lg transition-transform active:scale-95'>
                  <div className='relative z-10 text-on-primary'>
                    <span
                      className='material-symbols-outlined text-4xl mb-4'
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      qr_code_scanner
                    </span>
                    <h4 className='text-xl font-bold'>Launch QR Scanner</h4>
                    <p className='text-sm text-on-primary/80 mt-1'>Verify visitors and residents instantly</p>
                  </div>
                  <div className='absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform'>
                    <span className='material-symbols-outlined text-9xl'>camera</span>
                  </div>
                </button>
                <button className='w-full group relative overflow-hidden bg-surface-container-lowest p-8 rounded-2xl text-left border border-outline-variant/20 shadow-sm transition-transform active:scale-95'>
                  <div className='relative z-10'>
                    <span className='material-symbols-outlined text-4xl text-error mb-4'>warning</span>
                    <h4 className='text-xl font-bold text-on-surface'>Report Incident</h4>
                    <p className='text-sm text-on-surface-variant mt-1'>Document security breaches or alerts</p>
                  </div>
                </button>
                {/* Staff Station Info Card */}
                <div className='bg-tertiary-fixed/30 p-6 rounded-2xl border border-tertiary-fixed-dim/20'>
                  <div className='flex items-center space-x-4 mb-4'>
                    <span className='material-symbols-outlined text-tertiary'>potted_plant</span>
                    <span className='text-xs font-bold uppercase tracking-widest text-tertiary'>Station Status</span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-bold text-on-surface'>North Gate Station</p>
                      <p className='text-xs text-on-surface-variant'>Zone A • Level 1</p>
                    </div>
                    <div className='px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full'>
                      OPERATIONAL
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Access Log */}
              <div className='lg:col-span-8'>
                <div className='bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden'>
                  <div className='px-6 py-5 border-b border-surface-container flex justify-between items-center bg-white'>
                    <h3 className='text-sm font-bold uppercase tracking-widest text-on-surface'>
                      Real-time Access Log
                    </h3>
                    <button className='text-xs font-bold text-primary flex items-center space-x-1 hover:underline'>
                      <span>View Full History</span>
                      <span className='material-symbols-outlined text-sm'>arrow_forward</span>
                    </button>
                  </div>
                  <div className='divide-y divide-surface-container-low'>
                    {/* Entry 1 */}
                    <div className='px-6 py-4 flex items-center justify-between hover:bg-surface-bright transition-colors'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary'>
                          <span className='material-symbols-outlined'>person</span>
                        </div>
                        <div>
                          <p className='font-bold text-on-surface'>Phong</p>
                          <p className='text-xs text-on-surface-variant'>Visitor • Apartment AS-101</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-8'>
                        <div className='text-right'>
                          <p className='text-xs font-bold text-on-surface-variant'>08:09 AM</p>
                          <p className='text-[10px] text-on-surface-variant uppercase tracking-tighter'>
                            Entry Granted
                          </p>
                        </div>
                        <span className='px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100'>
                          SUCCESS
                        </span>
                      </div>
                    </div>
                    {/* Entry 2 */}
                    <div className='px-6 py-4 flex items-center justify-between hover:bg-surface-bright transition-colors'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 rounded-full bg-error-container/10 flex items-center justify-center text-error'>
                          <span className='material-symbols-outlined'>person_off</span>
                        </div>
                        <div>
                          <p className='font-bold text-on-surface'>Hoàn Phong</p>
                          <p className='text-xs text-on-surface-variant'>Visitor • Apartment AS-101</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-8'>
                        <div className='text-right'>
                          <p className='text-xs font-bold text-on-surface-variant'>08:05 AM</p>
                          <p className='text-[10px] text-on-surface-variant uppercase tracking-tighter'>Expired Pass</p>
                        </div>
                        <span className='px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full border border-red-100'>
                          DENIED
                        </span>
                      </div>
                    </div>
                    {/* Entry 3 */}
                    <div className='px-6 py-4 flex items-center justify-between hover:bg-surface-bright transition-colors'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-on-secondary-container'>
                          <span className='material-symbols-outlined'>home</span>
                        </div>
                        <div>
                          <p className='font-bold text-on-surface'>Nguyễn Văn D</p>
                          <p className='text-xs text-on-surface-variant'>Resident • Apartment AS-101</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-8'>
                        <div className='text-right'>
                          <p className='text-xs font-bold text-on-surface-variant'>07:50 AM</p>
                          <p className='text-[10px] text-on-surface-variant uppercase tracking-tighter'>
                            Facial Recognition
                          </p>
                        </div>
                        <span className='px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100'>
                          SUCCESS
                        </span>
                      </div>
                    </div>
                    {/* Entry 4 */}
                    <div className='px-6 py-4 flex items-center justify-between hover:bg-surface-bright transition-colors opacity-60'>
                      <div className='flex items-center space-x-4'>
                        <div className='w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant'>
                          <span className='material-symbols-outlined'>local_shipping</span>
                        </div>
                        <div>
                          <p className='font-bold text-on-surface'>Lazada Logistics</p>
                          <p className='text-xs text-on-surface-variant'>Delivery • Main Lobby</p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-8'>
                        <div className='text-right'>
                          <p className='text-xs font-bold text-on-surface-variant'>07:32 AM</p>
                          <p className='text-[10px] text-on-surface-variant uppercase tracking-tighter'>
                            Temporary Pass
                          </p>
                        </div>
                        <span className='px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100'>
                          SUCCESS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glass Insight AI Module */}
                <div className='mt-8 bg-surface-bright/60 backdrop-blur-xl p-8 rounded-3xl border border-white/40 shadow-xl shadow-blue-900/5 relative overflow-hidden'>
                  <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16'></div>
                  <div className='flex items-start space-x-6 relative z-10'>
                    <div className='bg-secondary-fixed p-3 rounded-2xl'>
                      <span
                        className='material-symbols-outlined text-on-secondary-fixed-variant'
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        insights
                      </span>
                    </div>
                    <div>
                      <h4 className='text-lg font-extrabold text-on-surface tracking-tight'>Homelink AI Insight</h4>
                      <p className='text-on-surface-variant mt-2 leading-relaxed text-sm'>
                        Traffic volume is <span className='font-bold text-primary'>15% higher</span> than usual for a
                        Tuesday morning. Recommend opening Lane 2 for resident entry between 08:30 AM and 09:15 AM to
                        prevent queueing at the North Gate.
                      </p>
                      <div className='mt-4 flex space-x-3'>
                        <button className='text-xs font-bold bg-primary text-on-primary px-4 py-2 rounded-full shadow-md'>
                          Implement Recommendation
                        </button>
                        <button className='text-xs font-bold text-on-surface-variant px-4 py-2 rounded-full border border-outline-variant/30 hover:bg-white transition-colors'>
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className='md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur-xl flex justify-around items-center py-3 px-6 z-50 border-t border-slate-100'>
        <button className='flex flex-col items-center text-blue-700'>
          <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>
            dashboard
          </span>
          <span className='text-[10px] font-bold mt-1'>Home</span>
        </button>
        <button className='flex flex-col items-center text-slate-400'>
          <span className='material-symbols-outlined'>qr_code_scanner</span>
          <span className='text-[10px] font-bold mt-1'>Scan</span>
        </button>
        <button className='flex flex-col items-center text-slate-400'>
          <span className='material-symbols-outlined'>person_search</span>
          <span className='text-[10px] font-bold mt-1'>Lookup</span>
        </button>
        <button className='flex flex-col items-center text-slate-400'>
          <span className='material-symbols-outlined'>account_circle</span>
          <span className='text-[10px] font-bold mt-1'>Profile</span>
        </button>
      </div>
    </div>
  )
}
