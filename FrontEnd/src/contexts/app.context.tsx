import React, { createContext, useState } from 'react'

import type { User } from 'src/types/user.type'
import { getAccessToken, getProfile } from 'src/utils/auth'

interface AppContextInterface {
  isAuthenticated: boolean
  SetIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  profile: User | null
  setProfile: React.Dispatch<React.SetStateAction<User | null>>
  reset: () => void
}

const init: AppContextInterface = {
  isAuthenticated: Boolean(getAccessToken()), //ép hàm sang kiểu boolean
  SetIsAuthenticated: () => null,
  profile: getProfile(),
  setProfile: () => null,
  reset: () => null
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextInterface>(init)
//vì sao thz createContext cần giá trị init:vì khi mà ta không truyền value vào thì sẽ lấy thz init

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, SetIsAuthenticated] = useState<boolean>(init.isAuthenticated)
  const [profile, setProfile] = useState<User | null>(init.profile)
  //giải thích vì sao cần có init cho createContext và useState:
  // vì khi ta khởi tạo context và state thì ta cần có giá trị ban đầu để tránh lỗi undefined khi truy cập vào context hoặc state trước khi chúng được cập nhật.
  const reset = () => {
    SetIsAuthenticated(false)
    setProfile(null)
  }

  return (
    <AppContext.Provider value={{ isAuthenticated, SetIsAuthenticated, profile, setProfile, reset }}>
      {children}
    </AppContext.Provider>
  )
}
