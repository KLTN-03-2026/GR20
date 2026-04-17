import React, { createContext, useState } from 'react'
import type { User } from 'src/types/user.type'
import { getAccessToken, getUser } from 'src/utils/auth'

interface AppContextInterface {
  isAuthenticated: boolean
  SetIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  reset: () => void
}

const init: AppContextInterface = {
  isAuthenticated: Boolean(getAccessToken()),
  SetIsAuthenticated: () => null,
  user: getUser(), // 👈 đổi profile → user
  setUser: () => null, // 👈 đổi setProfile → setUser
  reset: () => null
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppContextInterface>(init)

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, SetIsAuthenticated] = useState<boolean>(init.isAuthenticated)
  const [user, setUser] = useState<User | null>(init.user) // 👈 đổi profile → user

  const reset = () => {
    SetIsAuthenticated(false)
    setUser(null) // 👈 đổi setProfile → setUser
  }

  return (
    <AppContext.Provider value={{ isAuthenticated, SetIsAuthenticated, user, setUser, reset }}>
      {' '}
      {/* 👈 cập nhật value */}
      {children}
    </AppContext.Provider>
  )
}
